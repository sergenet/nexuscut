import paramiko
import time
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))

print("Cleaning...")
ssh.exec_command('rm -rf /var/www/nexuscut/.next')
ssh.exec_command('rm -f /var/www/nexuscut/next.config.*')

print("Building...")
stdin, stdout, stderr = ssh.exec_command('cd /var/www/nexuscut && npm run build')
out = stdout.read().decode('utf-8', errors='ignore')
print(out)

print("Restarting PM2...")
ssh.exec_command('cd /var/www/nexuscut && pm2 restart nexuscut')
time.sleep(2)
