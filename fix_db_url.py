import paramiko

def check():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    ssh.exec_command("sed -i 's|DATABASE_URL=\"file:/var|DATABASE_URL=\"file:///var|g' /var/www/nexuscut/.env")
    ssh.exec_command("sed -i 's|DATABASE_URL=\"file:/var|DATABASE_URL=\"file:///var|g' /var/www/nexuscut/.next/standalone/.env")
    
    ssh.exec_command('pm2 restart nexuscut --update-env')
    
    ssh.close()
    print("Fixed")

if __name__ == '__main__':
    check()
