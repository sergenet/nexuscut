import paramiko

host = '209.74.79.56'
username = 'root'
password = __import__('os').environ.get('VPS_PASSWORD','')

print(f'Connecting to {host}...')
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(host, username=username, password=password)

commands = """
cat << 'EOF' > /etc/nginx/sites-available/nexuscut
server {
    listen 80;
    server_name nexuscut.io www.nexuscut.io 209.74.79.56;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        client_max_body_size 2000M;
    }
}
EOF

ln -sf /etc/nginx/sites-available/nexuscut /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
systemctl restart nginx

# Run certbot for SSL
certbot --nginx -d nexuscut.io -d www.nexuscut.io --non-interactive --agree-tos -m admin@nexuscut.io --redirect

pm2 start npm --name "nexuscut" -- start || pm2 restart nexuscut
pm2 save
"""
print("Running Nginx Fix...")
stdin, stdout, stderr = ssh.exec_command(commands)

out = stdout.read().decode('utf-8', errors='ignore').encode('ascii', 'ignore').decode('ascii')
err = stderr.read().decode('utf-8', errors='ignore').encode('ascii', 'ignore').decode('ascii')

print("STDOUT:")
print(out)
print("STDERR:")
print(err)

ssh.close()
