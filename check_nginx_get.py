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

print('--- Nginx Access Logs (GET) ---')
stdin, stdout, stderr = ssh.exec_command('grep "185.98.169.47" /var/log/nginx/access.log | tail -n 20')
print(stdout.read().decode('utf-8', errors='replace'))

ssh.close()
