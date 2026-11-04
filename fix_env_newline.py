import paramiko

def check():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    # Read the current corrupted .env in the root
    stdin, stdout, stderr = ssh.exec_command('cat /var/www/nexuscut/.env')
    content = stdout.read().decode()
    
    # Fix the missing newline
    content = content.replace('"OPENAI_API_KEY', '"\nOPENAI_API_KEY')
    
    # Write back to root .env
    sftp = ssh.open_sftp()
    with sftp.file('/var/www/nexuscut/.env', 'w') as f:
        f.write(content)
        
    # Copy to standalone .env
    ssh.exec_command('cp /var/www/nexuscut/.env /var/www/nexuscut/.next/standalone/.env')
    
    # Restart pm2
    ssh.exec_command('pm2 restart nexuscut --update-env')
    
    ssh.close()
    print("Fixed newline")

if __name__ == '__main__':
    check()
