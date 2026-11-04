import paramiko

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    stdin, stdout, stderr = ssh.exec_command('cd /var/www/nexuscut && npx prisma db push --accept-data-loss && pm2 restart all')
    print("OUTPUT:", stdout.read().decode("utf-8", errors="replace"))
    ssh.close()
except Exception as e:
    print(e)
