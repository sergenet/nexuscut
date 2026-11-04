import paramiko

def check():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    stdin, stdout, stderr = ssh.exec_command('cp -r /var/www/nexuscut/public /var/www/nexuscut/.next/standalone/public && cp -r /var/www/nexuscut/.next/static /var/www/nexuscut/.next/standalone/.next/static && pm2 restart nexuscut')
    print("OUTPUT:")
    print(stdout.read().decode('utf-8'))
    print("ERRORS:")
    print(stderr.read().decode('utf-8'))
    
    ssh.close()

if __name__ == '__main__':
    check()
