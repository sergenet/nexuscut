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

print('--- PM2 Status ---')
stdin, stdout, stderr = ssh.exec_command('pm2 status')
print(stdout.read().decode('utf-8', errors='replace'))

print('--- PM2 Logs ---')
stdin, stdout, stderr = ssh.exec_command('tail -n 20 /root/.pm2/logs/nexuscut-error.log')
print(stdout.read().decode('utf-8', errors='replace'))
print('--- PM2 Out ---')
stdin, stdout, stderr = ssh.exec_command('tail -n 20 /root/.pm2/logs/nexuscut-out.log')
print(stdout.read().decode('utf-8', errors='replace'))

ssh.close()
