import paramiko

host = '209.74.79.56'
username = 'root'
password = __import__('os').environ.get('VPS_PASSWORD','')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(host, username=username, password=password)

conf = """
server {
    listen 80;
    server_name nexuscut.io www.nexuscut.io 209.74.79.56;

    root /var/www/nexuscut/public;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:3000;
        client_max_body_size 2000M;
        proxy_set_header Host $host;
    }

    location /_next/static/ {
        alias /var/www/nexuscut/.next/static/;
    }
}
"""

with ssh.open_sftp() as sftp:
    with sftp.file('/etc/nginx/sites-available/nexuscut', 'w') as f:
        f.write(conf)

ssh.exec_command('systemctl restart nginx')
ssh.close()
