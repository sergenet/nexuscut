import paramiko
import os
import time

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))

print("Uploading zip...")
local_path = 'C:\\NexusCut\\next_build.zip'
remote_path = '/var/www/nexuscut/next_build.zip'

sftp = ssh.open_sftp()
sftp.put(local_path, remote_path)
sftp.close()

remote_size = int(ssh.exec_command('stat -c%s ' + remote_path)[1].read().decode().strip())
local_size = os.path.getsize(local_path)

if remote_size != local_size:
    print(f"Error: Size mismatch! Local: {local_size}, Remote: {remote_size}")
    exit(1)

print("Size matches! Extracting...")
stdin, stdout, stderr = ssh.exec_command('cd /var/www/nexuscut && rm -rf .next && unzip -q next_build.zip -d .next && rm next_build.zip && pm2 restart nexuscut')
out = stdout.read().decode('utf-8', errors='ignore')
print("Done!")
