import paramiko

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    sftp = ssh.open_sftp()
    
    sftp.put('src/components/Editor/Canvas.tsx', '/var/www/nexuscut/src/components/Editor/Canvas.tsx')
    sftp.put('src/components/Editor/Timeline/Timeline.tsx', '/var/www/nexuscut/src/components/Editor/Timeline/Timeline.tsx')
    sftp.put('src/components/Editor/Timeline/PlayheadController.tsx', '/var/www/nexuscut/src/components/Editor/Timeline/PlayheadController.tsx')
    sftp.close()
    
    cmd = """
cd /var/www/nexuscut
npm run build
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/
pm2 restart nexuscut
"""
    stdin, stdout, stderr = ssh.exec_command(cmd)
    print("Deploy started in background, output:", stdout.read().decode("utf-8", errors="ignore").encode("ascii", errors="ignore").decode("ascii"))
    ssh.close()
except Exception as e:
    print(e)
