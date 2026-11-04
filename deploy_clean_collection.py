import paramiko
import os

local_zip = r"C:\NexusCut\secure_assets\caption_blueprint_collection.zip"
host = '209.74.79.56'
username = 'root'
password = __import__('os').environ.get('VPS_PASSWORD','')

print("Connecting to VPS via SSH...")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(host, username=username, password=password, timeout=30)
sftp = ssh.open_sftp()

remote_secure = "/var/www/nexuscut/secure_assets/caption_blueprint_collection.zip"
print(f"Uploading to {remote_secure}...")
sftp.put(local_zip, remote_secure)

remote_market = "/var/www/nexuscut/marketplace-files/cap-creator-collection/10-style-caption-blueprints.zip"
print(f"Uploading to {remote_market}...")
sftp.put(local_zip, remote_market)

sftp.close()

# Verify
stdin, stdout, stderr = ssh.exec_command("ls -lh /var/www/nexuscut/secure_assets/caption_blueprint_collection.zip /var/www/nexuscut/marketplace-files/cap-creator-collection/10-style-caption-blueprints.zip")
print(stdout.read().decode('ascii', errors='ignore'))
ssh.close()

print("Clean caption collection deployed to VPS!")
