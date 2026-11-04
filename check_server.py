import paramiko, sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))

cmds = [
    'nginx -t 2>&1',
    'cat /etc/nginx/sites-available/nexuscut',
    'ls -la /var/www/nexuscut/mobile/dist/landing.html /var/www/nexuscut/mobile/dist/index.html 2>&1',
    'ls -la /var/www/nexuscut/mobile/dist/assets/ 2>&1',
    'systemctl is-active nginx 2>&1',
    'curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1/ 2>&1',
]
for cmd in cmds:
    print(f'=== {cmd} ===')
    stdin, stdout, stderr = ssh.exec_command(cmd)
    stdout.channel.recv_exit_status()
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    if out.strip(): print(out.strip())
    if err.strip(): print('STDERR:', err.strip())
    print()

ssh.close()
