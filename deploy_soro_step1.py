import os
import sys
import time

import paramiko

HOST = "209.74.79.56"
USER = "root"
PW = __import__('os').environ.get('VPS_PASSWORD','')
LOCAL_SRC = r"C:\Projects\NexusCut-Website\NexusCut\src"
LOCAL_SCHEMA = r"C:\Projects\NexusCut-Website\NexusCut\prisma\schema.prisma"
REMOTE_ROOT = "/var/www/nexuscut"
EXCLUDE_DIRS = {"generated", "node_modules", ".next"}
NODE_PATH = "export PATH=$PATH:/root/.nvm/versions/node/v20.20.2/bin && "


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
    sftp = ssh.open_sftp()
    try:
        # 1. Backup current src so rollback is one command.
        ts = str(int(time.time()))
        backup = f"{REMOTE_ROOT}/src.bak-{ts}"
        code, out, err = run(ssh, f"cp -a {REMOTE_ROOT}/src {backup}")
        if code != 0:
            print("BACKUP FAILED:", err or out)
            return 1
        print(f"backup: {backup}")

        # 2. Upload local src (same exclusions as the established script).
        uploaded = 0
        for root, dirs, files in os.walk(LOCAL_SRC):
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
            rel = os.path.relpath(root, LOCAL_SRC)
            remote_dir = f"{REMOTE_ROOT}/src" + (f"/{rel.replace(os.sep, '/')}" if rel != "." else "")
            try:
                sftp.stat(remote_dir)
            except IOError:
                sftp.mkdir(remote_dir)
            for name in files:
                sftp.put(os.path.join(root, name), f"{remote_dir}/{name}")
                uploaded += 1
        print(f"uploaded: {uploaded} files")

        # 3. Remove the obsolete pre-route handler if it still exists remotely.
        code, out, err = run(ssh, f"rm -f {REMOTE_ROOT}/src/app/api/admin/soro/new-status.ts && echo removed-old || true")
        print("stale-file cleanup:", out.strip())

        # 4. Sync prisma schema, then create any missing tables (soroDraft etc.).
        sftp.put(LOCAL_SCHEMA, f"{REMOTE_ROOT}/prisma/schema.prisma")
        code, out, err = run(
            ssh,
            f"cd {REMOTE_ROOT} && {NODE_PATH}npx prisma db push 2>&1 | tail -8; echo DBPUSH_EXIT:${{PIPESTATUS[0]}}",
            timeout=300,
        )
        print("prisma db push:\n" + out.strip())
        if "DBPUSH_EXIT:0" not in out:
            print("DB PUSH FAILED")
            return 2

        # 5. Production env checks (values never printed; only presence + public URL).
        code, out, err = run(
            ssh,
            f"cd {REMOTE_ROOT} && "
            "echo ADMIN_EMAIL_set=$(grep -c '^ADMIN_EMAIL=' .env.local); "
            "grep -q '^ADMIN_EMAIL=' .env.local || printf '\\nADMIN_EMAIL=sergenet@yahoo.com\\n' >> .env.local; "
            "echo SMTP_user_set=$(grep -c '^SMTP_USER=' .env.local); "
            "echo SMTP_pass_set=$(grep -c '^SMTP_PASS=' .env.local); "
            "echo APP_URL=$(grep '^NEXT_PUBLIC_APP_URL=' .env.local | cut -d= -f2-); "
            "echo DBURL_set=$(grep -c '^DATABASE_URL=' .env .env.local 2>/dev/null | paste -sd+ | bc)",
        )
        print("env status:\n" + out.strip())
        print("STEP1 OK")
        return 0
    finally:
        sftp.close()
        ssh.close()


if __name__ == "__main__":
    sys.exit(main())
