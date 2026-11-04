import sys

import paramiko

HOST = "209.74.79.56"
USER = "root"
PW = __import__('os').environ.get('VPS_PASSWORD','')
REMOTE_ROOT = "/var/www/nexuscut"
NODE_PATH = "export PATH=$PATH:/root/.nvm/versions/node/v20.20.2/bin && "


def safe(text):
    return text.encode("cp1252", errors="replace").decode("cp1252")


def run(ssh, cmd, timeout=300):
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
            f"cd {REMOTE_ROOT} && {NODE_PATH}npx prisma db push 2>&1 | tail -6; echo DBPUSH_EXIT:${{PIPESTATUS[0]}}",
            timeout=300,
        )
        print(safe("prisma db push:\n" + out.strip()))
        if "DBPUSH_EXIT:0" not in out:
            print("DB PUSH FAILED:", safe(err))
            return 2

        code, out, err = run(
            ssh,
            f"cd {REMOTE_ROOT} && "
            "echo ADMIN_EMAIL_set=$(grep -c '^ADMIN_EMAIL=' .env.local); "
            "grep -q '^ADMIN_EMAIL=' .env.local || printf '\\nADMIN_EMAIL=sergenet@yahoo.com\\n' >> .env.local; "
            "echo ADMIN_EMAIL_after=$(grep -c '^ADMIN_EMAIL=' .env.local); "
            "echo SMTP_user_set=$(grep -c '^SMTP_USER=' .env.local); "
            "echo SMTP_pass_set=$(grep -c '^SMTP_PASS=' .env.local); "
            "echo APP_URL=$(grep '^NEXT_PUBLIC_APP_URL=' .env.local | cut -d= -f2-); "
            "echo DATABASE_URL_in_dotenv=$(grep -c '^DATABASE_URL=' .env)",
        )
        print(safe("env status:\n" + out.strip()))

        code, out, err = run(
            ssh,
            f"cd {REMOTE_ROOT} && {NODE_PATH}node -e \"const{{PrismaClient}}=require('@prisma/client');const p=new PrismaClient();p.soroDraft.count().then(c=>{{console.log('soroDraft_rows='+c);return p.soroFeedConfig.count()}}).then(c=>{{console.log('soroFeedConfig_rows='+c);return p.\$disconnect()}}).catch(e=>{{console.error('QUERY_ERR:'+e.message.slice(0,120));process.exit(1)}})\"",
            timeout=120,
        )
        print(safe("db check:\n" + out.strip() or err.strip()))
        if code != 0:
            return 3
        print("STEP2 OK")
        return 0
    finally:
        ssh.close()


if __name__ == "__main__":
    sys.exit(main())
