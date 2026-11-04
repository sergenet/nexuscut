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

print('Checking Nginx config...')
stdin, stdout, stderr = ssh.exec_command('nginx -t')
print(stdout.read().decode('utf-8', errors='replace'))
print(stderr.read().decode('utf-8', errors='replace'))

print('Checking sites-enabled...')
stdin, stdout, stderr = ssh.exec_command('ls -l /etc/nginx/sites-enabled/')
print(stdout.read().decode('utf-8', errors='replace'))

print('Checking nexuscut config...')
stdin, stdout, stderr = ssh.exec_command('cat /etc/nginx/sites-enabled/nexuscut')
print(stdout.read().decode('utf-8', errors='replace'))

print('Checking PM2 status...')
stdin, stdout, stderr = ssh.exec_command('pm2 status')
print(stdout.read().decode('utf-8', errors='replace'))

print('Checking port 3000 locally...')
stdin, stdout, stderr = ssh.exec_command('curl -I http://localhost:3000')
print(stdout.read().decode('utf-8', errors='replace'))

ssh.close()
