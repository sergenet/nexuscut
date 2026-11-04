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

print('--- Git Log ---')
stdin, stdout, stderr = ssh.exec_command('cd /var/www/nexuscut && git log -n 1')
print(stdout.read().decode('utf-8', errors='replace'))

print('--- VideoEditor.tsx grep ---')
stdin, stdout, stderr = ssh.exec_command('grep -A 5 "Uploading video" /var/www/nexuscut/src/components/VideoEditor.tsx')
print(stdout.read().decode('utf-8', errors='replace'))

print('--- Port 3000 ---')
stdin, stdout, stderr = ssh.exec_command('lsof -i :3000')
print(stdout.read().decode('utf-8', errors='replace'))

ssh.close()
