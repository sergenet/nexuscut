import paramiko
import time
import sys
import io

# Force UTF-8 for stdout
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

host = '209.74.79.56'
username = 'root'
password = __import__('os').environ.get('VPS_PASSWORD','')

print('Reading local .env.local...')
with open(r'C:\NexusCut\.env.local', 'r', encoding='utf-8') as f:
    env_data = f.read()

deploy_script = f"""#!/bin/bash
set -e

echo "=== Fixing Application Directory ==="
rm -rf /var/www/nexuscut
mkdir -p /var/www/nexuscut
cd /var/www/nexuscut

echo "=== Cloning Repository ==="
git clone https://github.com/sergenet/nexuscut.git .

echo "=== Writing Environment Variables ==="
cat << 'EOF' > .env.local
{env_data}
DATABASE_URL="file:./dev.db"
EOF

echo "=== Installing NPM Packages ==="
npm install

echo "=== Building Next.js App ==="
npm run build

echo "=== Starting App with PM2 ==="
pm2 stop nexuscut || true
pm2 delete nexuscut || true
pm2 start npm --name "nexuscut" -- start
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
        proxy_set_header Upgrade \;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \System.Management.Automation.Internal.Host.InternalHost;
        proxy_cache_bypass \;
        
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

print('Uploading deployment script...')
sftp = ssh.open_sftp()
with sftp.file('/root/deploy_vps2.sh', 'w') as f:
    f.write(deploy_script)
sftp.close()

print('Executing deployment script...')
stdin, stdout, stderr = ssh.exec_command('chmod +x /root/deploy_vps2.sh && /root/deploy_vps2.sh')

# Stream the output
while not stdout.channel.exit_status_ready():
    if stdout.channel.recv_ready():
        print(stdout.channel.recv(1024).decode('utf-8', errors='replace'), end='')
    if stderr.channel.recv_stderr_ready():
        print(stderr.channel.recv_stderr(1024).decode('utf-8', errors='replace'), end='', file=sys.stderr)
    time.sleep(0.5)

# Print any remaining output
print(stdout.read().decode('utf-8', errors='replace'))
print(stderr.read().decode('utf-8', errors='replace'), file=sys.stderr)

exit_status = stdout.channel.recv_exit_status()
print(f'Deployment finished with exit code {exit_status}')
ssh.close()
