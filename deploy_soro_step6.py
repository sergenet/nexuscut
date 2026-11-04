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
        # Mint magic link.
        code, out, err = run(
            ssh,
            f"cd {REMOTE_ROOT} && {NODE_PATH}node -e \"const{{PrismaClient}}=require('@prisma/client');const crypto=require('crypto');const p=new PrismaClient();(async()=>{{const token=crypto.randomBytes(32).toString('hex');await p.magicLink.create({{data:{{email:'sergenet@yahoo.com',token,expiresAt:new Date(Date.now()+10*60*1000)}}}});console.log('TOKEN='+token);await p.\$disconnect();}})().catch(e=>{{console.error(e.message.slice(0,160));process.exit(1)}})\"",
        )
        token = out.split("TOKEN=")[1].strip()

        # Show ALL set-cookie lines from verify, then pick the nexus one.
        code, out, _ = run(
            ssh,
            f"curl -s -i --max-time 20 '{LOCAL}/api/auth/verify?token={token}&returnTo=%2Fadmin' | grep -i '^set-cookie' ",
        )
        print("--- set-cookie headers ---")
        print(safe(out.strip()))
        m = re.search(r"nexus_session_id=([^;\s]+)", out)
        if not m:
            print("NO NEXUS COOKIE FOUND")
            return 1
        cookie = m.group(1)
        print("cookie captured, len:", len(cookie))

        # Does the cookie authenticate a GET?
        code, out, _ = run(
            ssh,
            f"curl -s -o /dev/null -w '%{{http_code}}' -b 'nexus_session_id={cookie}' '{LOCAL}/admin'",
        )
        print("GET /admin with cookie:", out.strip())

        # Does sha256(cookie) equal the stored clerkId?
        code, out, err = run(
            ssh,
            f"cd {REMOTE_ROOT} && {NODE_PATH}node -e \"const{{PrismaClient}}=require('@prisma/client');const crypto=require('crypto');const p=new PrismaClient();(async()=>{{const u=await p.user.findUnique({{where:{{email:'sergenet@yahoo.com'}}}});const h=crypto.createHash('sha256').update('{cookie}').digest('hex');console.log('hash_matches_clerkId='+(u.clerkId===h));console.log('clerkId_len='+(u.clerkId||'').length);console.log('clerkId_prefix='+(u.clerkId||'').slice(0,8));console.log('hash_prefix='+h.slice(0,8));await p.\$disconnect();}})().catch(e=>{{console.error(e.message.slice(0,200));process.exit(1)}})\"",
        )
        print(safe(out.strip() or err.strip()))
        return 0
    finally:
        ssh.close()


if __name__ == "__main__":
    sys.exit(main())
