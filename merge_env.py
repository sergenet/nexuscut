import paramiko

def check():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    # Merge .env.local into .env
    ssh.exec_command('cat /var/www/nexuscut/.env.local >> /var/www/nexuscut/.env')
    
    # Also copy .env to the standalone directory so the server.js can read it!
    ssh.exec_command('cp /var/www/nexuscut/.env /var/www/nexuscut/.next/standalone/.env')
    
    # Restart PM2
    ssh.exec_command('pm2 restart nexuscut --update-env')
    
    ssh.close()
    print("Done")

if __name__ == '__main__':
    check()
