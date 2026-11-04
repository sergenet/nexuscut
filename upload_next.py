import paramiko
import os

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))

print("Uploading zip...")
sftp = ssh.open_sftp()
sftp.put('C:\\NexusCut\\next_build.zip', '/var/www/nexuscut/next_build.zip')
sftp.close()

print("Extracting...")
stdin, stdout, stderr = ssh.exec_command('cd /var/www/nexuscut && rm -rf .next && unzip -q next_build.zip -d .next && rm next_build.zip && pm2 restart nexuscut')
out = stdout.read().decode('utf-8', errors='ignore')
err = stderr.read().decode('utf-8', errors='ignore')

print(out)
print(err)
print("Done!")
