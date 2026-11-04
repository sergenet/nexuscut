import paramiko

def check():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    sftp = ssh.open_sftp()
    sftp.put('C:/NexusCut/src/pages/api/export.ts', '/var/www/nexuscut/src/pages/api/export.ts')
    sftp.close()
    
    ssh.exec_command('cd /var/www/nexuscut && npm run build && pm2 restart nexuscut')
    
    ssh.close()

if __name__ == '__main__':
    check()
