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

print('--- .env files on VPS ---')
stdin, stdout, stderr = ssh.exec_command('ls -la /var/www/nexuscut/.env*')
print(stdout.read().decode('utf-8', errors='replace'))

print('--- Contents of .env.local ---')
stdin, stdout, stderr = ssh.exec_command('cat /var/www/nexuscut/.env.local | grep OPENAI')
print(stdout.read().decode('utf-8', errors='replace'))

ssh.close()
