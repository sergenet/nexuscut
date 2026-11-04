import paramiko

def check():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    sftp = ssh.open_sftp()
    
    remote_path = '/var/www/nexuscut/src/pages/api/export.ts'
    local_path = 'src/pages/api/export.ts'
    
    sftp.put(local_path, remote_path)
    print("Pushed export.ts")
    
    print("Rebuilding Next.js...")
    stdin, stdout, stderr = ssh.exec_command('cd /var/www/nexuscut && NODE_OPTIONS="--max-old-space-size=1536" npm run build')
    stdout.channel.recv_exit_status() 
    
    ssh.exec_command('pm2 restart nexuscut')
    print("Restarted PM2")
    
    sftp.close()
    ssh.close()

if __name__ == '__main__':
    check()
