import paramiko

def update():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    env_vars = '''
SMTP_HOST=mail.privateemail.com
SMTP_PORT=465
SMTP_USER=noreply@nexuscut.io
SMTP_PASS=change-me
'''
    
    # Append to .env
    ssh.exec_command(f'echo "{env_vars}" >> /var/www/nexuscut/.env')
    
    # Restart PM2
    print("Restarting PM2...")
    stdin, stdout, stderr = ssh.exec_command('pm2 restart nexuscut')
    print(stdout.read().decode('utf-8'))
    
    ssh.close()
    print("Done")

if __name__ == '__main__':
    update()
