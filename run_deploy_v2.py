import paramiko
import time
import sys
import os

host = '209.74.79.56'
username = 'root'
password = __import__('os').environ.get('VPS_PASSWORD','')
local_zip = r'C:\NexusCut\deploy.zip'
remote_zip = '/root/deploy.zip'
app_dir = '/var/www/nexuscut'

print('Reading local .env.local...')
with open(r'C:\NexusCut\.env.local', 'r', encoding='utf-8') as f:
    env_data = f.read()

setup_script = f"""#!/bin/bash
set -e

echo "=== Updating System & Dependencies ==="
apt-get update
DEBIAN_FRONTEND=noninteractive apt-get install -y curl unzip ffmpeg nginx

echo "=== Installing Node.js 20 & PM2 ==="
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
DEBIAN_FRONTEND=noninteractive apt-get install -y nodejs
npm install -g pm2 || true

echo "=== Setting up Application Directory ==="
rm -rf {app_dir}
mkdir -p {app_dir}

echo "=== Extracting App ==="
unzip -q {remote_zip} -d {app_dir}

echo "=== Writing Environment Variables ==="
cat << 'EOF' > {app_dir}/.env.local
{env_data}
EOF
cat << 'EOF' > {app_dir}/.env
{env_data}
EOF

echo "=== Starting App with PM2 ==="
cd {app_dir}
pm2 stop nexuscut || true
pm2 delete nexuscut || true
# Next.js standalone entry is server.js
pm2 start server.js --name "nexuscut"
pm2 save
pm2 startup systemd -u root --hp /root || true

echo "=== Configuring Nginx ==="
cat << 'EOF' > /etc/nginx/sites-available/nexuscut
server {{
    listen 80;
    server_name nexuscut.io www.nexuscut.io 209.74.79.56;

    location / {{
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        
        # Allow large file uploads for mobile streaming
        client_max_body_size 2000M;
    }}
}}
EOF

ln -sf /etc/nginx/sites-available/nexuscut /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
systemctl restart nginx

echo "=== Deployment Complete! ==="
"""

print(f'Connecting to {host}...')
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(host, username=username, password=password)

print('Uploading deploy.zip (this may take a few minutes)...')
sftp = ssh.open_sftp()
sftp.put(local_zip, remote_zip)

print('Uploading setup script...')
with sftp.file('/root/setup_vps.sh', 'w') as f:
    f.write(setup_script)
sftp.close()

print('Executing setup script...')
stdin, stdout, stderr = ssh.exec_command('chmod +x /root/setup_vps.sh && /root/setup_vps.sh')

while not stdout.channel.exit_status_ready():
    if stdout.channel.recv_ready():
        print(stdout.channel.recv(1024).decode('utf-8', errors='ignore'), end='')
    if stderr.channel.recv_stderr_ready():
        print(stderr.channel.recv_stderr(1024).decode('utf-8', errors='ignore'), end='', file=sys.stderr)
    time.sleep(0.5)

print(stdout.read().decode('utf-8', errors='ignore'))
print(stderr.read().decode('utf-8', errors='ignore'), file=sys.stderr)

exit_status = stdout.channel.recv_exit_status()
print(f'Deployment finished with exit code {exit_status}')
ssh.close()
