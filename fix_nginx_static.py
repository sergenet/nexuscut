import paramiko

host = '209.74.79.56'
username = 'root'
password = __import__('os').environ.get('VPS_PASSWORD','')

nginx_conf = """server {
    listen 80;
    server_name nexuscut.io www.nexuscut.io 209.74.79.56;

    root /var/www/nexuscut/mobile/dist;
    index index.html;

    client_max_body_size 2000M;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|wasm|woff|woff2)$ {
        expires 1d;
        add_header Cache-Control public;
    }
}
"""

print('Connecting...')
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(host, username=username, password=password)

# Write nginx config via sftp
print('Writing nginx config...')
sftp = ssh.open_sftp()
with sftp.file('/etc/nginx/sites-available/nexuscut', 'w') as f:
    f.write(nginx_conf)
sftp.close()

# Enable and reload
cmds = [
    'ln -sf /etc/nginx/sites-available/nexuscut /etc/nginx/sites-enabled/',
    'rm -f /etc/nginx/sites-enabled/default',
    'nginx -t',
    'systemctl reload nginx',
    'echo NGINX_OK'
]
for cmd in cmds:
    stdin, stdout, stderr = ssh.exec_command(cmd)
    code = stdout.channel.recv_exit_status()
    out = stdout.read().decode('utf-8', errors='ignore').encode('ascii', 'ignore').decode().strip()
    err = stderr.read().decode('utf-8', errors='ignore').encode('ascii', 'ignore').decode().strip()
    print(f'[{code}] {cmd}')
    if out: print('  OUT:', out)
    if err: print('  ERR:', err)

ssh.close()
print('Done!')
