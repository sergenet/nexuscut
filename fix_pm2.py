import paramiko
import time
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))

print("Fixing PM2...")
ssh.exec_command('pm2 delete nexuscut')
time.sleep(2)
ssh.exec_command('cd /var/www/nexuscut && pm2 start npm --name "nexuscut" -- start')
time.sleep(2)
ssh.exec_command('pm2 save')
