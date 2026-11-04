import paramiko
import os
import shutil

local_pkg_dir = r"C:\NexusCut\scratch\final_packages"
local_secure = r"C:\NexusCut\secure_assets"
os.makedirs(local_secure, exist_ok=True)

# Copy locally
for f in ["asmr_backgrounds.zip", "gta_backgrounds.zip", "all_access_background_bundle.zip"]:
    src = os.path.join(local_pkg_dir, f)
    dst = os.path.join(local_secure, f)
    shutil.copy(src, dst)
    print(f"Copied locally: {dst}")

# Connect to VPS
host = '209.74.79.56'
username = 'root'
password = __import__('os').environ.get('VPS_PASSWORD','')

print("Connecting to VPS via SSH...")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(host, username=username, password=password, timeout=30)
sftp = ssh.open_sftp()

remote_secure = "/var/www/nexuscut/secure_assets"
ssh.exec_command(f"mkdir -p {remote_secure}")

for f in ["asmr_backgrounds.zip", "gta_backgrounds.zip", "all_access_background_bundle.zip"]:
    lpath = os.path.join(local_pkg_dir, f)
    rpath = f"{remote_secure}/{f}"
    print(f"Uploading {f} ({os.path.getsize(lpath) / 1024 / 1024:.2f} MB) to {rpath}...")
    sftp.put(lpath, rpath)
    print(f"Upload complete for {f}")

sftp.close()

# Also update marketplace-files on VPS with individual mp4 files
update_script = """
cd /var/www/nexuscut
mkdir -p marketplace-files/bg-satisfying-loops marketplace-files/bg-gameplay-loops
rm -f marketplace-files/bg-satisfying-loops/*.mp4 marketplace-files/bg-gameplay-loops/*.mp4

# Extract clips into marketplace-files
unzip -o -q secure_assets/asmr_backgrounds.zip -d marketplace-files/bg-satisfying-loops/
unzip -o -q secure_assets/gta_backgrounds.zip -d marketplace-files/bg-gameplay-loops/
rm -f marketplace-files/bg-satisfying-loops/README.txt marketplace-files/bg-gameplay-loops/README.txt

ls -lh secure_assets/*.zip
echo "Done updating VPS assets!"
"""

stdin, stdout, stderr = ssh.exec_command(update_script)
out = stdout.read().decode('ascii', errors='ignore')
print(out)
ssh.close()
print("All bundle assets deployed to VPS!")
