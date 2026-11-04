import paramiko

host = '209.74.79.56'
username = 'root'
password = __import__('os').environ.get('VPS_PASSWORD','')

print(f'Connecting to {host}...')
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(host, username=username, password=password)

print('Executing remaining setup commands...')
commands = """
cd /var/www/nexuscut
npm install -g pm2
pm2 stop nexuscut || true
pm2 delete nexuscut || true
pm2 start server.js --name "nexuscut"
pm2 save

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
"""

stdin, stdout, stderr = ssh.exec_command(commands)
exit_status = stdout.channel.recv_exit_status()

# Decode safely ignoring errors to avoid UnicodeEncodeError
print("STDOUT:")
print(stdout.read().decode('utf-8', errors='ignore').encode('ascii', 'ignore').decode('ascii'))
print("STDERR:")
print(stderr.read().decode('utf-8', errors='ignore').encode('ascii', 'ignore').decode('ascii'))

print(f'Finished with exit code {exit_status}')
ssh.close()
