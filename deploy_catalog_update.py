import paramiko
import os
import sys

host = '209.74.79.56'
username = 'root'
password = __import__('os').environ.get('VPS_PASSWORD','')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(host, username=username, password=password, timeout=20)

sftp = ssh.open_sftp()
local_path = r'C:\NexusCut\src\lib\marketplaceData.ts'
remote_path = '/var/www/nexuscut/src/lib/marketplaceData.ts'
print(f"Uploading {local_path} -> {remote_path}...")
sftp.put(local_path, remote_path)
sftp.close()

print("Rebuilding Next.js on VPS...")
build_cmd = 'cd /var/www/nexuscut && export NODE_OPTIONS="--max-old-space-size=2048" && npm run build'
stdin, stdout, stderr = ssh.exec_command(build_cmd, get_pty=True)

for line in iter(stdout.readline, ""):
    sys.stdout.write(line.encode('ascii', 'replace').decode('ascii'))
    sys.stdout.flush()

exit_status = stdout.channel.recv_exit_status()
print(f"Build exit code: {exit_status}")

if exit_status == 0:
    print("Restarting PM2 application...")
    ssh.exec_command('pm2 restart all || pm2 restart nexuscut')
    print("Marketplace catalog successfully deployed to live VPS!")
else:
    err = stderr.read().decode('ascii', errors='replace')
    print("Build failed with errors:")
    print(err)

ssh.close()
