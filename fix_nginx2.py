import paramiko
try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    # We will update the server_name in the port 80 block to include nexuscut.com, and redirect to https://nexuscut.io
    nginx_config = """
server {
    server_name nexuscut.io www.nexuscut.io nexuscut.com www.nexuscut.com 209.74.79.56;

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

    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/nexuscut.io/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/nexuscut.io/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}
server {
    listen 80;
    server_name nexuscut.io www.nexuscut.io nexuscut.com www.nexuscut.com 209.74.79.56;
    
    # Redirect everything to https://nexuscut.io
    return 301 https://nexuscut.io$request_uri;
}
"""
    sftp = ssh.open_sftp()
    with sftp.file('/etc/nginx/sites-available/nexuscut', 'w') as f:
        f.write(nginx_config)
    sftp.close()
    
    stdin, stdout, stderr = ssh.exec_command('nginx -t && systemctl reload nginx')
    print("NGINX:", stdout.read().decode("utf-8", errors="replace"))
    print("ERR:", stderr.read().decode("utf-8", errors="replace"))
    ssh.close()
except Exception as e:
    print(e)
