import paramiko
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

host = '209.74.79.56'
username = 'root'
password = __import__('os').environ.get('VPS_PASSWORD','')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(host, username=username, password=password)

nginx_conf = """server {
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

    location /temp/ {
        alias /tmp/;
        add_header Access-Control-Allow-Origin *;
    }
}
"""

print('Writing Nginx config...')
sftp = ssh.open_sftp()
with sftp.file('/etc/nginx/sites-available/nexuscut', 'w') as f:
    f.write(nginx_conf)
sftp.close()

print('Linking config and restarting Nginx...')
stdin, stdout, stderr = ssh.exec_command('ln -sf /etc/nginx/sites-available/nexuscut /etc/nginx/sites-enabled/nexuscut && rm -f /etc/nginx/sites-enabled/default && systemctl restart nginx')
print(stdout.read().decode('utf-8', errors='replace'))
print(stderr.read().decode('utf-8', errors='replace'))

ssh.close()
