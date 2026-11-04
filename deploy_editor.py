import paramiko

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    sftp = ssh.open_sftp()
    
    sftp.put('src/components/VideoEditor.tsx', '/var/www/nexuscut/src/components/VideoEditor.tsx')
    sftp.put('src/components/Editor/Sidebar.tsx', '/var/www/nexuscut/src/components/Editor/Sidebar.tsx')
    sftp.put('src/components/Editor/PropertiesPanel.tsx', '/var/www/nexuscut/src/components/Editor/PropertiesPanel.tsx')
    sftp.put('src/components/Editor/GrowthModeWizard.tsx', '/var/www/nexuscut/src/components/Editor/GrowthModeWizard.tsx')
    sftp.put('src/components/Editor/TrackMedia.tsx', '/var/www/nexuscut/src/components/Editor/TrackMedia.tsx')
    sftp.close()
    
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
