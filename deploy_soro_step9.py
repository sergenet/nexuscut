import sys
import time

import paramiko

HOST = "209.74.79.56"
USER = "root"
PW = __import__('os').environ.get('VPS_PASSWORD','')
REMOTE_ROOT = "/var/www/nexuscut"
NODE_PATH = "export PATH=$PATH:/root/.nvm/versions/node/v20.20.2/bin && "
LOCAL_FILE = r"C:\Projects\NexusCut-Website\NexusCut\src\app\marketplace\page.tsx"


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
    sftp = ssh.open_sftp()
    try:
        sftp.put(LOCAL_FILE, f"{REMOTE_ROOT}/src/app/marketplace/page.tsx")
        print("marketplace page uploaded")

        run(
            ssh,
            f"cd {REMOTE_ROOT} && rm -f /root/deploy_build.exit && nohup bash -c '{NODE_PATH}npm run build > /root/deploy_build.log 2>&1; echo $? > /root/deploy_build.exit' > /dev/null 2>&1 & echo BUILD_STARTED",
        )
        exit_code = None
        for _ in range(36):
            time.sleep(15)
            code, out, _ = run(ssh, "cat /root/deploy_build.exit 2>/dev/null")
            if out.strip().isdigit():
                exit_code = int(out.strip())
                break
            print("...build still running")
        if exit_code is None:
            print("BUILD STILL RUNNING - restart deferred")
            return 4
        print(f"BUILD_EXIT={exit_code}")
        if exit_code != 0:
            code, out, _ = run(ssh, "tail -20 /root/deploy_build.log")
            print(safe(out))
            print("BUILD FAILED - old site still serving.")
            return 2

        code, out, err = run(ssh, "pm2 restart nexuscut --update-env && sleep 4 && pm2 status | head -6", timeout=120)
        print(safe(out))
        if code != 0:
            print("PM2 RESTART FAILED:", safe(err))
            return 3
        code, out, _ = run(ssh, "curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000/marketplace")
        print("local marketplace status:", out.strip())
        print("STEP9 OK")
        return 0
    finally:
        sftp.close()
        ssh.close()


if __name__ == "__main__":
    sys.exit(main())
