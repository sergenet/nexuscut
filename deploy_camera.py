import paramiko

def check():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    sftp = ssh.open_sftp()
    
    sftp.put('src/components/Editor/Sidebar.tsx', '/var/www/nexuscut/src/components/Editor/Sidebar.tsx')
    sftp.put('src/components/Editor/CameraRecorderModal.tsx', '/var/www/nexuscut/src/components/Editor/CameraRecorderModal.tsx')
    
    print("Files uploaded.")
    
    print("Building Next.js...")
    ssh.exec_command('cd /var/www/nexuscut && NODE_OPTIONS="--max-old-space-size=1536" npm run build')
    
    sftp.close()
    ssh.close()

if __name__ == '__main__':
    check()
