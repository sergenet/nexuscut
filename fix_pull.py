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

print('Resetting and pulling latest code...')
stdin, stdout, stderr = ssh.exec_command('cd /var/www/nexuscut && git reset --hard && git pull origin main')
print(stdout.read().decode('utf-8', errors='replace'))
print(stderr.read().decode('utf-8', errors='replace'))

print('Building Next.js app...')
stdin, stdout, stderr = ssh.exec_command('cd /var/www/nexuscut && npm run build')
print(stdout.read().decode('utf-8', errors='replace'))
print(stderr.read().decode('utf-8', errors='replace'))

print('Restarting PM2...')
stdin, stdout, stderr = ssh.exec_command('pm2 restart nexuscut')
print(stdout.read().decode('utf-8', errors='replace'))
print(stderr.read().decode('utf-8', errors='replace'))

ssh.close()
