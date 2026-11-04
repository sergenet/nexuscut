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
        # Owner session again.
        code, out, err = run(
            ssh,
            f"cd {REMOTE_ROOT} && {NODE_PATH}node -e \"const{{PrismaClient}}=require('@prisma/client');const crypto=require('crypto');const p=new PrismaClient();(async()=>{{const token=crypto.randomBytes(32).toString('hex');await p.magicLink.create({{data:{{email:'sergenet@yahoo.com',token,expiresAt:new Date(Date.now()+10*60*1000)}}}});console.log('TOKEN='+token);await p.\$disconnect();}})().catch(e=>{{console.error(e.message.slice(0,160));process.exit(1)}})\"",
        )
        token = out.split("TOKEN=")[1].strip()
        code, out, _ = run(
            ssh,
            f"curl -s -i --max-time 20 '{LOCAL}/api/auth/verify?token={token}&returnTo=%2Fadmin' | grep -i 'set-cookie' | head -1",
        )
        cookie = re.search(r"nexus_session_id=([^;\\s]+)", out).group(1)

        # Re-run import but capture the redirect destination.
        code, out, _ = run(
            ssh,
            f"curl -s -o /dev/null -w '%{{redirect_url}}' -X POST -b 'nexus_session_id={cookie}' '{LOCAL}/api/admin/soro/import'",
            timeout=120,
        )
        print("import redirect:", out.strip())

        # Prod draft inventory + feed host.
        code, out, err = run(
            ssh,
            f"cd {REMOTE_ROOT} && {NODE_PATH}node -e \"const{{PrismaClient}}=require('@prisma/client');const p=new PrismaClient();(async()=>{{const ds=await p.soroDraft.findMany({{select:{{slug:true,status:true}},orderBy:{{importedAt:'desc'}}}});console.log('count='+ds.length);console.log(JSON.stringify(ds.slice(0,20)));const c=await p.soroFeedConfig.findUnique({{where:{{id:'primary'}}}});console.log('feed_host='+(c?new URL(c.feedUrl).hostname+new URL(c.feedUrl).pathname.split('/').slice(0,2).join('/'):'NONE'));await p.\$disconnect();}})().catch(e=>{{console.error(e.message.slice(0,160));process.exit(1)}})\"",
        )
        print(safe(out.strip() or err.strip()))
        return 0
    finally:
        ssh.close()


if __name__ == "__main__":
    sys.exit(main())
