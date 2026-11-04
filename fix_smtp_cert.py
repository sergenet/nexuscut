import paramiko

def fix():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    # Update SMTP_HOST to match the SSL certificate
    ssh.exec_command('sed -i "s/SMTP_HOST=mail.nexuscut.io/SMTP_HOST=premium303.web-hosting.com/g" /var/www/nexuscut/.env')
    
    # Load .env into the shell, then restart pm2 with --update-env
    stdin, stdout, stderr = ssh.exec_command('bash -c "set -a; source /var/www/nexuscut/.env; set +a; pm2 restart nexuscut --update-env"')
    exit_status = stdout.channel.recv_exit_status()
    print("Restart exit code:", exit_status)
    
    ssh.close()
    print("Done")

if __name__ == '__main__':
    fix()
