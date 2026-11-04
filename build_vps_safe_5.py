import paramiko
import os

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))

files = [
    ('C:\\NexusCut\\src\\components\\Editor\\TrackMedia.tsx', '/var/www/nexuscut/src/components/Editor/TrackMedia.tsx'),
    ('C:\\NexusCut\\src\\components\\Editor\\Canvas.tsx', '/var/www/nexuscut/src/components/Editor/Canvas.tsx')
]

sftp = ssh.open_sftp()
for local_path, remote_path in files:
    sftp.put(local_path, remote_path)
sftp.close()

print("Files uploaded. Building again...")
stdin, stdout, stderr = ssh.exec_command('export NODE_OPTIONS="--max-old-space-size=2048" && cd /var/www/nexuscut && npm run build')
out = stdout.read()
err = stderr.read()

with open('vps_build_out.txt', 'wb') as f:
    f.write(out)
with open('vps_build_err.txt', 'wb') as f:
    f.write(err)

ssh.exec_command('pm2 restart nexuscut')
print("Done!")
