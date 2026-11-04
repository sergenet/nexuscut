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

print('Copying .env.local to .env and running prisma db push...')
stdin, stdout, stderr = ssh.exec_command('cd /var/www/nexuscut && cp .env.local .env && npx prisma db push')
print(stdout.read().decode('utf-8', errors='replace'))
print(stderr.read().decode('utf-8', errors='replace'))

print('Starting PM2...')
stdin, stdout, stderr = ssh.exec_command('cd /var/www/nexuscut && pm2 stop nexuscut || true && pm2 delete nexuscut || true && pm2 start npm --name "nexuscut" -- start && pm2 save')
print(stdout.read().decode('utf-8', errors='replace'))
print(stderr.read().decode('utf-8', errors='replace'))

print('Restarting Nginx...')
stdin, stdout, stderr = ssh.exec_command('systemctl restart nginx')
print(stdout.read().decode('utf-8', errors='replace'))
print(stderr.read().decode('utf-8', errors='replace'))

ssh.close()
