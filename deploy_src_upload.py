import os
import stat
import sys
import time

import paramiko

HOST = "209.74.79.56"
USER = "root"
PW = __import__('os').environ.get('VPS_PASSWORD','')
LOCAL_SRC = r"C:\Projects\NexusCut-Website\NexusCut\src"
REMOTE_ROOT = "/var/www/nexuscut"
EXCLUDE_DIRS = {"generated", "node_modules", ".next"}
NODE_PATH = "export PATH=$PATH:/root/.nvm/versions/node/v20.20.2/bin && "
# The box has 2 GB of RAM, so V8 picks a ~1 GB old-space ceiling by default and
# `next build` dies with "Reached heap limit" during the type-check phase once
# the project grows past it. 3 GB is safe here because the host has 4 GB of swap
# behind it; leave room for the OS and the running web process.
BUILD_MEMORY = "export NODE_OPTIONS=--max-old-space-size=3072 && "


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

        # 2. Upload local src (skip generated clients; VPS keeps its own).
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
                local_path = os.path.join(root, name)
                remote_path = f"{remote_dir}/{name}"
                sftp.put(local_path, remote_path)
                uploaded += 1
        print(f"uploaded: {uploaded} files")

        # 3. Build on the VPS. The running site keeps serving the old build
        #    until we explicitly restart pm2, so a failed build is safe.
        build_cmd = (
            f"cd {REMOTE_ROOT} && {NODE_PATH}{BUILD_MEMORY}npm run build > /root/deploy_build.log 2>&1; "
            "echo BUILD_EXIT:$?"
        )
        code, out, err = run(ssh, build_cmd, timeout=1200)
        print(out.strip())
        tail_code, tail, _ = run(ssh, "tail -25 /root/deploy_build.log")
        print(tail)
        if "BUILD_EXIT:0" not in out:
            print("BUILD FAILED - pm2 NOT restarted, old site still serving.")
            return 2

        # 4. Restart the web process (backend nexuscut-ai untouched).
        code, out, err = run(ssh, "pm2 restart nexuscut --update-env && sleep 4 && pm2 status | head -12", timeout=120)
        print(out)
        if code != 0:
            print("PM2 RESTART FAILED:", err)
            return 3

        # 5. Local smoke check straight from the box.
        code, out, err = run(ssh, "curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000/")
        print("local http status:", out)
        print("DEPLOY OK")
        return 0
    finally:
        sftp.close()
        ssh.close()


if __name__ == "__main__":
    # Next's build log contains box-drawing characters, and Windows defaults
    # stdout to cp1252, which raised mid-deploy and skipped the pm2 restart.
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding="utf-8", errors="replace")
        except AttributeError:
            pass
    sys.exit(main())
