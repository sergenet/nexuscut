import paramiko

def fix():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    ssh.exec_command('sed -i "s/\\r//g" /var/www/nexuscut/.env')
    
    print("Restarting PM2...")
    stdin, stdout, stderr = ssh.exec_command('pm2 restart nexuscut')
    exit_status = stdout.channel.recv_exit_status()
    print("Build exit code:", exit_status)
    
    ssh.close()
    print("Done")

if __name__ == '__main__':
    fix()
