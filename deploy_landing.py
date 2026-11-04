import paramiko, io, tarfile

host = '209.74.79.56'
username = 'root'
password = __import__('os').environ.get('VPS_PASSWORD','')

# New nginx config:
#   /           -> landing.html  (the new marketing page)
#   everything else -> index.html (Expo app — handles /editor etc.)
NEW_NGINX_CFG = r"""server {
    listen 80;
    server_name nexuscut.io www.nexuscut.io 209.74.79.56;

    root /var/www/nexuscut/mobile/dist;
    index landing.html;

    client_max_body_size 2000M;

    # Root → marketing landing page
    location = / {
        try_files /landing.html =404;
    }

    # Editor and all Expo app routes → Expo SPA
    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|wasm|woff|woff2)$ {
        expires 1d;
        add_header Cache-Control public;
    }
}
"""

print('Connecting...')
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(host, username=username, password=password)

# ── 1. Upload new dist ────────────────────────────────────────────────────────
sftp = ssh.open_sftp()

print('Creating archive from local dist...')
buf = io.BytesIO()
with tarfile.open(fileobj=buf, mode='w:gz') as tar:
    tar.add(r'C:\NexusCut\mobile\dist', arcname='dist')
buf.seek(0)

print(f'Archive size: {buf.getbuffer().nbytes / 1024 / 1024:.1f} MB')
print('Uploading dist...')
sftp.putfo(buf, '/root/mobile_dist.tar.gz')
sftp.close()

print('Extracting on server...')
stdin, stdout, stderr = ssh.exec_command(
    'rm -rf /var/www/nexuscut/mobile/dist && '
    'mkdir -p /var/www/nexuscut/mobile && '
    'tar -xzf /root/mobile_dist.tar.gz -C /var/www/nexuscut/mobile/'
)
code = stdout.channel.recv_exit_status()
err = stderr.read().decode('utf-8', errors='ignore')
print(f'Extract code: {code}')
if err: print('ERR:', err)

# ── 2. Update nginx config ────────────────────────────────────────────────────
print('Updating nginx config...')
sftp2 = ssh.open_sftp()
with sftp2.open('/etc/nginx/sites-available/nexuscut', 'w') as f:
    f.write(NEW_NGINX_CFG)
sftp2.close()

# Test and reload nginx
print('Testing nginx config...')
stdin, stdout, stderr = ssh.exec_command('nginx -t && systemctl reload nginx')
code = stdout.channel.recv_exit_status()
out = stdout.read().decode()
err = stderr.read().decode()
print(f'Reload code: {code}')
if out: print('OUT:', out)
if err: print('INFO:', err)

print('Done! Landing page is now live at /')
ssh.close()
