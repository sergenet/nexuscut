import os
import subprocess
import paramiko
import time

host = '209.74.79.56'
username = 'root'
password = __import__('os').environ.get('VPS_PASSWORD','')

print("1. Building Next.js Standalone App...")
subprocess.run("npm run build", shell=True, check=True, cwd="C:\\NexusCut")

print("2. Copying public directory and AI scripts to standalone...")
subprocess.run('Copy-Item -Path "public" -Destination ".next\\standalone\\public" -Recurse -Force', shell=True, cwd="C:\\NexusCut", executable="powershell")
subprocess.run('Copy-Item -Path "src\\ai" -Destination ".next\\standalone\\src\\ai" -Recurse -Force', shell=True, cwd="C:\\NexusCut", executable="powershell")

print("3. Zipping deploy package...")
subprocess.run('tar.exe -caf deploy_ai.zip -C .next\\standalone .', shell=True, check=True, cwd="C:\\NexusCut")

print("4. Uploading to VPS...")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(host, username=username, password=password)

with ssh.open_sftp() as sftp:
    sftp.put("C:\\NexusCut\\deploy_ai.zip", "/root/deploy_ai.zip")

print("5. Installing Python Dependencies on VPS...")
# Install rembg and opencv-python on the VPS
ssh.exec_command("pip3 install rembg opencv-python")

print("6. Extracting and restarting PM2...")
commands = """
cd /var/www/nexuscut
unzip -o -q /root/deploy_ai.zip -d /var/www/nexuscut
pm2 restart nexuscut
"""
stdin, stdout, stderr = ssh.exec_command(commands)
exit_status = stdout.channel.recv_exit_status()

print("STDOUT:", stdout.read().decode('utf-8', errors='ignore'))
print("Deployment Complete!")
ssh.close()
