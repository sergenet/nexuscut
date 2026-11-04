import re
import sys

import paramiko

HOST = "209.74.79.56"
USER = "root"
PW = __import__('os').environ.get('VPS_PASSWORD','')
REMOTE_ROOT = "/var/www/nexuscut"
NODE_PATH = "export PATH=$PATH:/root/.nvm/versions/node/v20.20.2/bin && "
LOCAL = "http://127.0.0.1:3000"


def safe(text):
    return text.encode("cp1252", errors="replace").decode("cp1252")


def run(ssh, cmd, timeout=180):
    _stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode("utf-8", errors="replace")
    err = stderr.read().decode("utf-8", errors="replace")
    code = stdout.channel.recv_exit_status()
    return code, out, err


def main():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, username=USER, password=PW, timeout=30)
    try:
        code, out, err = run(
            ssh,
            f"cd {REMOTE_ROOT} && {NODE_PATH}node -e \"const{{PrismaClient}}=require('@prisma/client');const crypto=require('crypto');const p=new PrismaClient();(async()=>{{const token=crypto.randomBytes(32).toString('hex');await p.magicLink.create({{data:{{email:'sergenet@yahoo.com',token,expiresAt:new Date(Date.now()+10*60*1000)}}}});console.log('TOKEN='+token);await p.\$disconnect();}})().catch(e=>{{console.error('ERR:'+e.message.slice(0,160));process.exit(1)}})\"",
        )
        if "TOKEN=" not in out:
            print("MINT FAILED:", safe(out + err))
            return 1
        token = out.split("TOKEN=")[1].strip()

        code, out, err = run(
            ssh,
            f"curl -s -i --max-time 20 '{LOCAL}/api/auth/verify?token={token}&returnTo=%2Fmarketplace' | grep -i 'set-cookie: nexus_session_id'",
        )
        matches = re.findall(r"nexus_session_id=([^;\s]+)", out)
        if not matches:
            print("VERIFY FAILED - headers:", safe(out + err))
            return 1
        cookie = matches[-1]
        print(f"cookies_in_response={len(matches)}")

        code, out, _ = run(ssh, f"curl -s -b 'nexus_session_id={cookie}' '{LOCAL}/admin' | grep -c 'Signed in as owner'")
        print("admin_authenticated:", out.strip())

        for item in ["bg-satisfying-loops", "bg-all-access-bundle"]:
            code, out, err = run(
                ssh,
                f"curl -s -X POST -b 'nexus_session_id={cookie}' -H 'Content-Type: application/json' -d '{{\"itemId\":\"{item}\"}}' '{LOCAL}/api/stripe/checkout-addon'",
                timeout=120,
            )
            print(safe(f"{item} -> {out.strip()[:200]}"))
        return 0
    finally:
        ssh.close()


if __name__ == "__main__":
    sys.exit(main())
