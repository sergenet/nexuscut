import paramiko, sys

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))

# Read nginx config
stdin, stdout, stderr = ssh.exec_command(
    'cat /etc/nginx/sites-enabled/nexuscut 2>/dev/null || '
    'cat /etc/nginx/conf.d/nexuscut.conf 2>/dev/null || '
    'cat /etc/nginx/sites-enabled/default 2>/dev/null'
)
out = stdout.read().decode('utf-8', 'ignore')
with open('nginx_config.txt', 'w', encoding='utf-8') as f:
    f.write(out)

# Upload new backend server.js
sftp = ssh.open_sftp()
sftp.put('backend/server.js', '/var/www/nexuscut/backend/server.js')
sftp.close()
print('Uploaded backend/server.js')

# Install ffmpeg-installer in backend
stdin, stdout, stderr = ssh.exec_command(
    'cd /var/www/nexuscut/backend && npm install @ffmpeg-installer/ffmpeg --save 2>&1 | tail -3'
)
out = stdout.read().decode('utf-8', 'ignore')
print('npm install:', out)

# Restart backend
stdin, stdout, stderr = ssh.exec_command('pm2 restart nexuscut-ai')
out = stdout.read().decode('utf-8', 'ignore')
err = stderr.read().decode('utf-8', 'ignore')
print('pm2 restart:', out, err)

ssh.close()
print('Done')
