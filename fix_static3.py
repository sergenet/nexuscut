import paramiko

def check():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    ssh.exec_command('cp -r /var/www/nexuscut/.next/static /var/www/nexuscut/.next/standalone/.next/static && pm2 restart nexuscut')
    
    ssh.close()

if __name__ == '__main__':
    check()
