import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))

# Read current nginx config path
stdin, stdout, stderr = ssh.exec_command(
    'ls /etc/nginx/sites-enabled/'
)
files = stdout.read().decode('utf-8', 'ignore').strip()
print('Sites enabled:', files)

new_nginx = r"""server {
    server_name nexuscut.io www.nexuscut.io 209.74.79.56;

    # Route /api/backend-transcribe directly to Express backend - bypasses Next.js 10MB limit
    location /api/backend-transcribe {
        proxy_pass http://localhost:3001/api/transcribe;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_read_timeout 600;
        proxy_connect_timeout 600;
        proxy_send_timeout 600;
        client_max_body_size 2000M;
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 600;
        proxy_connect_timeout 600;
        proxy_send_timeout 600;
        proxy_cache_bypass $http_upgrade;
        
        client_max_body_size 2000M;
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/nexuscut.io/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/nexuscut.io/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}
server {
    if ($host = www.nexuscut.io) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    if ($host = nexuscut.io) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    listen 80;
    server_name nexuscut.io www.nexuscut.io 209.74.79.56;
    return 404; # managed by Certbot
}
"""

# Write to tmp first
with open('/tmp/nexuscut_nginx.conf', 'w') as f:
    f.write(new_nginx)

sftp = ssh.open_sftp()
sftp.put('/tmp/nexuscut_nginx.conf', '/tmp/nexuscut_nginx.conf')
sftp.close()

# Copy to nginx and test
stdin, stdout, stderr = ssh.exec_command(
    'cp /tmp/nexuscut_nginx.conf /etc/nginx/sites-enabled/nexuscut && nginx -t 2>&1'
)
out = stdout.read().decode('utf-8', 'ignore')
err = stderr.read().decode('utf-8', 'ignore')
result = out + err
print('nginx test:', result)

if 'successful' in result or 'test is successful' in result:
    stdin, stdout, stderr = ssh.exec_command('systemctl reload nginx')
    print('Nginx reloaded')
else:
    print('Nginx test FAILED - reverting')

ssh.close()
print('Done')
