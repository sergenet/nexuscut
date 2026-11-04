import os
import sys
import time

import paramiko

HOST = "209.74.79.56"
USER = "root"
PW = __import__('os').environ.get('VPS_PASSWORD','')
ROOT = r"C:\Projects\NexusCut-Website\NexusCut"
REMOTE_ROOT = "/var/www/nexuscut"
NODE_PATH = "export PATH=$PATH:/root/.nvm/versions/node/v20.20.2/bin && "

SINGLE_FILES = [
    (r"src\lib\marketplaceDelivery.ts", "/src/lib/marketplaceDelivery.ts"),
    (r"src\app\api\marketplace\download\[token]\route.ts", "/src/app/api/marketplace/download/[token]/route.ts"),
    (r"src\app\api\marketplace\fulfill\route.ts", "/src/app/api/marketplace/fulfill/route.ts"),
    (r"src\app\api\stripe\checkout-addon\route.ts", "/src/app/api/stripe/checkout-addon/route.ts"),
    (r"src\app\marketplace\success\page.tsx", "/src/app/marketplace/success/page.tsx"),
    (r"src\lib\marketplaceData.ts", "/src/lib/marketplaceData.ts"),
    (r"public\marketplace\bundle.svg", "/public/marketplace/bundle.svg"),
]


def safe(text):
    return text.encode("cp1252", errors="replace").decode("cp1252")


def run(ssh, cmd, timeout=300):
    _stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode("utf-8", errors="replace")
    err = stderr.read().decode("utf-8", errors="replace")
    code = stdout.channel.recv_exit_status()
    return code, out, err


def put_skip(sftp, local_path, remote_path):
    local_size = os.path.getsize(local_path)
    try:
        remote_size = sftp.stat(remote_path).st_size
    except IOError:
        remote_size = -1
    if remote_size == local_size:
        return "skip"
    sftp.put(local_path, remote_path)
    return "put"


def main():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, username=USER, password=PW, timeout=30)
    sftp = ssh.open_sftp()
    try:
        for rel, remote in SINGLE_FILES:
            run(ssh, f"mkdir -p '{REMOTE_ROOT}{os.path.dirname(remote)}'")
            result = put_skip(sftp, os.path.join(ROOT, rel), f"{REMOTE_ROOT}{remote}")
            print(result, remote)

        # Product files: one subfolder per catalog item, resumable by size.
        base_local = os.path.join(ROOT, "marketplace-files")
        base_remote = f"{REMOTE_ROOT}/marketplace-files"
        run(ssh, f"mkdir -p {base_remote}")
        put = skip = 0
        for item in sorted(os.listdir(base_local)):
            item_local = os.path.join(base_local, item)
            if not os.path.isdir(item_local):
                continue
            run(ssh, f"mkdir -p {base_remote}/{item}")
            for name in sorted(os.listdir(item_local)):
                res = put_skip(
                    sftp,
                    os.path.join(item_local, name),
                    f"{base_remote}/{item}/{name}",
                )
                if res == "put":
                    put += 1
                    print("uploaded:", item, name)
                else:
                    skip += 1
        print(f"product files: {put} uploaded, {skip} already present")

        # Build + restart only when this is the full run (single files uploaded
        # in the same pass), so a resumed run can finish uploading first.
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
        print("STEP11 OK")
        return 0
    finally:
        sftp.close()
        ssh.close()


if __name__ == "__main__":
    sys.exit(main())
