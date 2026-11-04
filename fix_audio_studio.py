import paramiko

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    # 1. perform a date-stamped backup of the target file
    ssh.exec_command('cp /var/www/nexuscut/src/app/tools/audio-studio/page.tsx /var/www/nexuscut/src/app/tools/audio-studio/page_backup_2026-07-31.tsx')
    
    # 2. Upload the fixed file
    sftp = ssh.open_sftp()
    sftp.put('src/app/tools/audio-studio/page.tsx', '/var/www/nexuscut/src/app/tools/audio-studio/page.tsx')
    sftp.close()
    
    # 3. Rebuild and restart
    cmd = """
cd /var/www/nexuscut
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
