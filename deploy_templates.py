import paramiko

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    sftp = ssh.open_sftp()
    
    # upload the page update
    sftp.put('src/app/templates/page.tsx', '/var/www/nexuscut/src/app/templates/page.tsx')
    sftp.close()
    
    cmd = """
cd /var/www/nexuscut
npm run build
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/
mkdir -p .next/standalone/src/ai
cp -r src/ai/* .next/standalone/src/ai/
pm2 restart nexuscut
"""
    stdin, stdout, stderr = ssh.exec_command(cmd)
    
    print("OUTPUT:", stdout.read().decode("utf-8", errors="replace").encode("ascii", errors="ignore").decode("ascii"))
    
    ssh.close()
except Exception as e:
    print(e)
