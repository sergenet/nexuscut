import paramiko
import os

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))

local_path = 'C:\\NexusCut\\src\\components\\Editor\\TrackMedia.tsx'
remote_path = '/var/www/nexuscut/src/components/Editor/TrackMedia.tsx'

sftp = ssh.open_sftp()
sftp.put(local_path, remote_path)
sftp.close()

print("File uploaded. Building again...")
stdin, stdout, stderr = ssh.exec_command('export NODE_OPTIONS="--max-old-space-size=2048" && cd /var/www/nexuscut && npm run build')
out = stdout.read()
err = stderr.read()

with open('vps_build_out.txt', 'wb') as f:
    f.write(out)
with open('vps_build_err.txt', 'wb') as f:
    f.write(err)

ssh.exec_command('pm2 restart nexuscut')
print("Done!")
