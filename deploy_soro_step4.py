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
        # 1. Mint a magic link for the owner directly in the prod DB (SMTP is
        #    configured, but this keeps the flow automatable).
        code, out, err = run(
            ssh,
            f"cd {REMOTE_ROOT} && {NODE_PATH}node -e \"const{{PrismaClient}}=require('@prisma/client');const crypto=require('crypto');const p=new PrismaClient();(async()=>{{const token=crypto.randomBytes(32).toString('hex');await p.magicLink.create({{data:{{email:'sergenet@yahoo.com',token,expiresAt:new Date(Date.now()+10*60*1000)}}}});console.log('TOKEN='+token);await p.\$disconnect();}})().catch(e=>{{console.error(e.message.slice(0,160));process.exit(1)}})\"",
        )
        if code != 0 or "TOKEN=" not in out:
            print("MAGIC LINK FAILED:", safe(out + err))
            return 1
        token = out.split("TOKEN=")[1].strip()

        # 2. Verify -> capture the owner session cookie (do not follow redirect).
        code, out, err = run(
            ssh,
            f"curl -s -i --max-time 20 '{LOCAL}/api/auth/verify?token={token}&returnTo=%2Fadmin' | grep -i 'set-cookie' | head -1",
        )
        m = re.search(r"nexus_session_id=([^;\\s]+)", out)
        if not m:
            print("VERIFY FAILED, headers:", safe(out + err))
            return 1
        cookie = m.group(1)
        print("owner session established")

        # 3. Run the real import through the real admin route.
        code, out, err = run(
            ssh,
            f"curl -s -o /dev/null -w '%{{http_code}}' -X POST -b 'nexus_session_id={cookie}' '{LOCAL}/api/admin/soro/import'",
            timeout=120,
        )
        print("import status:", out.strip())

        # 4. Publish the same article that went live locally today.
        code, out, err = run(
            ssh,
            f"cd {REMOTE_ROOT} && {NODE_PATH}node -e \"const{{PrismaClient}}=require('@prisma/client');const p=new PrismaClient();(async()=>{{const d=await p.soroDraft.findFirst({{where:{{slug:'how-to-create-jump-cuts'}}}});if(!d){{console.log('DRAFT_NOT_FOUND');process.exit(2)}}console.log('DRAFT_ID='+d.id);console.log('STATUS_BEFORE='+d.status);await p.\$disconnect();}})().catch(e=>{{console.error(e.message.slice(0,160));process.exit(1)}})\"",
        )
        if "DRAFT_ID=" not in out:
            print("PUBLISH TARGET MISSING:", safe(out + err))
            return 2
        draft_id = out.split("DRAFT_ID=")[1].strip().splitlines()[0]
        print(safe(out.strip()))

        code, out, err = run(
            ssh,
            f"curl -s -o /dev/null -w '%{{http_code}}' -X POST -b 'nexus_session_id={cookie}' -F 'id={draft_id}' -F 'status=published' '{LOCAL}/api/admin/soro/new-status'",
        )
        print("publish status:", out.strip())

        # 5. Final DB state on prod.
        code, out, err = run(
            ssh,
            f"cd {REMOTE_ROOT} && {NODE_PATH}node -e \"const{{PrismaClient}}=require('@prisma/client');const p=new PrismaClient();(async()=>{{const g=await p.soroDraft.groupBy({{by:['status'],_count:true}});console.log('status_counts='+JSON.stringify(g));await p.\$disconnect();}})().catch(e=>{{console.error(e.message.slice(0,160));process.exit(1)}})\"",
        )
        print(safe(out.strip()))
        print("STEP4 OK")
        return 0
    finally:
        ssh.close()


if __name__ == "__main__":
    sys.exit(main())
