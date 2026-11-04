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

        # Verify, then take the LAST nexus_session_id header (the real one
        # comes after the proxy's anonymous session cookie).
        code, out, _ = run(
            ssh,
            f"curl -s -i --max-time 20 '{LOCAL}/api/auth/verify?token={token}&returnTo=%2Fadmin' | grep -i 'set-cookie: nexus_session_id' ",
        )
        matches = re.findall(r"nexus_session_id=([^;\s]+)", out)
        if not matches:
            print("NO COOKIE")
            return 1
        cookie = matches[-1]
        print(f"cookies_in_response={len(matches)} using=last")

        # Prove this cookie is really the owner (not the sign-in screen).
        code, out, _ = run(
            ssh,
            f"curl -s -b 'nexus_session_id={cookie}' '{LOCAL}/admin' | grep -c 'Signed in as owner'",
        )
        print("dashboard_authenticated:", out.strip())

        # Import the feed through the real admin route.
        code, out, _ = run(
            ssh,
            f"curl -s -o /dev/null -w '%{{http_code}} %{{redirect_url}}' -X POST -b 'nexus_session_id={cookie}' '{LOCAL}/api/admin/soro/import'",
            timeout=150,
        )
        print("import:", out.strip())

        # Publish the jump-cuts article.
        code, out, err = run(
            ssh,
            f"cd {REMOTE_ROOT} && {NODE_PATH}node -e \"const{{PrismaClient}}=require('@prisma/client');const p=new PrismaClient();(async()=>{{const d=await p.soroDraft.findFirst({{where:{{slug:'how-to-create-jump-cuts'}}}});if(!d){{console.log('DRAFT_NOT_FOUND');process.exit(2)}}console.log('DRAFT_ID='+d.id);console.log('STATUS_BEFORE='+d.status);await p.\$disconnect();}})().catch(e=>{{console.error(e.message.slice(0,160));process.exit(1)}})\"",
        )
        if "DRAFT_ID=" not in out:
            print("PUBLISH TARGET MISSING:", safe(out + err))
            return 2
        print(safe(out.strip()))
        draft_id = out.split("DRAFT_ID=")[1].strip().splitlines()[0]

        code, out, _ = run(
            ssh,
            f"curl -s -o /dev/null -w '%{{http_code}}' -X POST -b 'nexus_session_id={cookie}' -F 'id={draft_id}' -F 'status=published' '{LOCAL}/api/admin/soro/new-status'",
        )
        print("publish:", out.strip())

        # Final prod DB state.
        code, out, err = run(
            ssh,
            f"cd {REMOTE_ROOT} && {NODE_PATH}node -e \"const{{PrismaClient}}=require('@prisma/client');const p=new PrismaClient();(async()=>{{const g=await p.soroDraft.groupBy({{by:['status'],_count:true}});console.log('status_counts='+JSON.stringify(g));await p.\$disconnect();}})().catch(e=>{{console.error(e.message.slice(0,160));process.exit(1)}})\"",
        )
        print(safe(out.strip()))
        print("STEP7 OK")
        return 0
    finally:
        ssh.close()


if __name__ == "__main__":
    sys.exit(main())
