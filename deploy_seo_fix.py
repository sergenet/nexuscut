import paramiko
import os
import sys

host = '209.74.79.56'
username = 'root'
password = __import__('os').environ.get('VPS_PASSWORD','')

files_to_upload = [
    ('src/app/downloads/page.tsx', '/var/www/nexuscut/src/app/downloads/page.tsx'),
    ('src/app/account/page.tsx', '/var/www/nexuscut/src/app/account/page.tsx'),
    ('src/app/affiliates/dashboard/page.tsx', '/var/www/nexuscut/src/app/affiliates/dashboard/page.tsx'),
    ('src/app/robots.ts', '/var/www/nexuscut/src/app/robots.ts'),
]

print("Connecting to VPS...")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(host, username=username, password=password, timeout=20)

print("Uploading changed files via SFTP...")
sftp = ssh.open_sftp()
for local_rel, remote_abs in files_to_upload:
    local_path = os.path.join(r'C:\NexusCut', local_rel.replace('/', '\\'))
    remote_dir = os.path.dirname(remote_abs)
    # Ensure remote directory exists
    ssh.exec_command(f'mkdir -p {remote_dir}')
    print(f"Uploading {local_rel} -> {remote_abs}")
    sftp.put(local_path, remote_abs)
sftp.close()

print("Building Next.js application on VPS...")
build_cmd = 'cd /var/www/nexuscut && export NODE_OPTIONS="--max-old-space-size=2048" && npm run build'
stdin, stdout, stderr = ssh.exec_command(build_cmd, get_pty=True)

for line in iter(stdout.readline, ""):
    sys.stdout.write(line.encode('ascii', 'replace').decode('ascii'))
    sys.stdout.flush()

exit_status = stdout.channel.recv_exit_status()
print(f"Build exit code: {exit_status}")

if exit_status == 0:
    print("Restarting PM2 application...")
    stdin, stdout, stderr = ssh.exec_command('pm2 restart all || pm2 restart nexuscut')
    out = stdout.read().decode('ascii', errors='replace')
    print(out)
    print("Deployment successfully completed!")
else:
    err = stderr.read().decode('ascii', errors='replace')
    print("Build failed with errors:")
    print(err)

ssh.close()
