import paramiko
try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    stdin, stdout, stderr = ssh.exec_command('export PATH=$PATH:/root/.nvm/versions/node/v20.20.2/bin && pm2 status > /var/www/nexuscut/pm2_status.txt && pm2 logs nexuscut --lines 50 --nostream > /var/www/nexuscut/pm2_logs.txt')
    stdout.channel.recv_exit_status()
    
    sftp = ssh.open_sftp()
    sftp.get('/var/www/nexuscut/pm2_logs.txt', 'pm2_logs.txt')
    sftp.get('/var/www/nexuscut/pm2_status.txt', 'pm2_status.txt')
    sftp.close()
    ssh.close()
except Exception as e:
    print(e)
