import paramiko

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    cmd = """
cd /var/www/nexuscut
sed -i 's|DATABASE_URL="file:./dev.db"|DATABASE_URL="file:/var/www/nexuscut/dev.db"|g' .env
npx prisma db push --accept-data-loss
npx prisma generate
pm2 restart all
"""
    stdin, stdout, stderr = ssh.exec_command(cmd)
    print("OUTPUT:", stdout.read().decode("utf-8", errors="replace"))
    
    ssh.close()
except Exception as e:
    print(e)
