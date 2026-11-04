import paramiko, io, tarfile

host = '209.74.79.56'
username = 'root'
password = __import__('os').environ.get('VPS_PASSWORD','')

print('Connecting...')
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(host, username=username, password=password)

# ── 1. Read current nginx config ──────────────────────────────────────────────
print('Reading nginx config...')
stdin, stdout, stderr = ssh.exec_command('cat /etc/nginx/sites-available/nexuscut')
current_cfg = stdout.read().decode()
print('Current config:')
print(current_cfg)
print('---')
ssh.close()
