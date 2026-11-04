import paramiko

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    sftp = ssh.open_sftp()
    
    ssh.exec_command('mkdir -p /var/www/nexuscut/src/app/api/marketing/templates')
    
    # upload files
    sftp.put('prisma/schema.prisma', '/var/www/nexuscut/prisma/schema.prisma')
    sftp.put('src/app/api/marketing/templates/route.ts', '/var/www/nexuscut/src/app/api/marketing/templates/route.ts')
    sftp.put('src/app/templates/page.tsx', '/var/www/nexuscut/src/app/templates/page.tsx')
    sftp.close()
    
    cmd = """
cd /var/www/nexuscut
npx prisma db push --accept-data-loss
npx prisma generate
npm run build
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/
pm2 restart nexuscut
"""
    stdin, stdout, stderr = ssh.exec_command(cmd)
    
    print("OUTPUT:", stdout.read().decode("utf-8", errors="replace").encode("ascii", errors="ignore").decode("ascii"))
    
    ssh.close()
except Exception as e:
    print(e)
