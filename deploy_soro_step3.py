import sys
import time

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
        # Confirm the admin email matches the owner (value not echoed).
        code, out, _ = run(
            ssh,
            f"cd {REMOTE_ROOT} && [ \"$(grep '^ADMIN_EMAIL=' .env.local | cut -d= -f2- | tr 'A-Z' 'a-z')\" = 'sergenet@yahoo.com' ] && echo ADMIN_EMAIL_MATCH=YES || echo ADMIN_EMAIL_MATCH=NO",
        )
        print(out.strip())

        # Kick off the build detached so a dropped SSH connection cannot kill it.
        run(
            ssh,
            f"cd {REMOTE_ROOT} && rm -f /root/deploy_build.exit && nohup bash -c '{NODE_PATH}npm run build > /root/deploy_build.log 2>&1; echo $? > /root/deploy_build.exit' > /dev/null 2>&1 & echo BUILD_STARTED",
        )

        # Poll for completion (max ~9 minutes).
        exit_code = None
        for _ in range(36):
            time.sleep(15)
            code, out, _ = run(ssh, "cat /root/deploy_build.exit 2>/dev/null")
            if out.strip().isdigit():
                exit_code = int(out.strip())
                break
            print("...build still running")
        if exit_code is None:
            print("BUILD STILL RUNNING after poll window - pm2 NOT restarted yet.")
            return 4
        print(f"BUILD_EXIT={exit_code}")
        code, out, _ = run(ssh, "tail -12 /root/deploy_build.log")
        print(safe("build tail:\n" + out.strip()))
        if exit_code != 0:
            print("BUILD FAILED - pm2 NOT restarted, old site still serving.")
            return 2

        code, out, err = run(ssh, "pm2 restart nexuscut --update-env && sleep 4 && pm2 status | head -12", timeout=120)
        print(safe(out))
        if code != 0:
            print("PM2 RESTART FAILED:", safe(err))
            return 3

        code, out, _ = run(ssh, "curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000/")
        print("local http status:", out.strip())
        print("DEPLOY OK")
        return 0
    finally:
        ssh.close()


if __name__ == "__main__":
    sys.exit(main())
