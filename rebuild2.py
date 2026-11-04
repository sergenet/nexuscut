import paramiko
try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    stdin, stdout, stderr = ssh.exec_command('cd /var/www/nexuscut && export PATH=$PATH:/root/.nvm/versions/node/v20.20.2/bin && npm run build > build_log.txt 2>&1')
    exit_status = stdout.channel.recv_exit_status()
    
    sftp = ssh.open_sftp()
    sftp.get('/var/www/nexuscut/build_log.txt', 'build_log.txt')
    sftp.close()
    ssh.close()
except Exception as e:
    print(e)
