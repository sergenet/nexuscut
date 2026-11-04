import paramiko

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    sftp = ssh.open_sftp()
    sftp.put('prisma/schema.prisma', '/var/www/nexuscut/prisma/schema.prisma')
    sftp.close()
    
    cmd = """
cd /var/www/nexuscut
npx prisma db push --accept-data-loss
npx prisma generate
pm2 stop all
rm -rf .next
npm run build
pm2 start all
"""
    stdin, stdout, stderr = ssh.exec_command(cmd)
    out = stdout.read().decode("utf-8", errors="replace")
    print(out.encode("ascii", errors="ignore").decode("ascii"))
    err = stderr.read().decode("utf-8", errors="replace")
    print(err.encode("ascii", errors="ignore").decode("ascii"))
    
    ssh.close()
except Exception as e:
    print(e)
