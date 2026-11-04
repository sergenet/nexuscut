import paramiko
import subprocess

host = '209.74.79.56'
username = 'root'
password = __import__('os').environ.get('VPS_PASSWORD','')

print("1. Zipping backend...")
subprocess.run('tar.exe -caf backend.zip -C backend .', shell=True, check=True, cwd="C:\\NexusCut")

print("2. Uploading backend to VPS...")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(host, username=username, password=password)

with ssh.open_sftp() as sftp:
    sftp.put("C:\\NexusCut\\backend.zip", "/root/backend.zip")

print("3. Deploying backend on VPS...")
commands = """
mkdir -p /var/www/nexuscut/backend
unzip -o -q /root/backend.zip -d /var/www/nexuscut/backend
cd /var/www/nexuscut/backend
npm install
npm install -g pm2
pm2 stop nexuscut-ai || true
pm2 start server.js --name "nexuscut-ai"
pm2 save

# Update Nginx to proxy /api
CONFIG_FILE="/etc/nginx/sites-available/default"
if ! grep -q "location /api" "$CONFIG_FILE"; then
    sed -i 's|location / {|location /api {\n        proxy_pass http://localhost:3001;\n        proxy_set_header Host $host;\n        proxy_set_header X-Real-IP $remote_addr;\n        client_max_body_size 100M;\n    }\n\n    location / {|g' "$CONFIG_FILE"
    systemctl reload nginx
fi
"""
stdin, stdout, stderr = ssh.exec_command(commands)
exit_status = stdout.channel.recv_exit_status()
print(stdout.read().decode())
print(stderr.read().decode())

print("Deployment Complete!")
ssh.close()
