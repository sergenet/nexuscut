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

print('--- Rebuilding VPS ---')
commands = [
    'cd /var/www/nexuscut',
    'rm -rf .next',
    'npm run build',
    'pm2 restart nexuscut --update-env'
]
stdin, stdout, stderr = ssh.exec_command(' && '.join(commands))
print(stdout.read().decode('utf-8', errors='replace'))
print(stderr.read().decode('utf-8', errors='replace'))

ssh.close()
