import paramiko
try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    sftp = ssh.open_sftp()
    sftp.put('tailwind.config.ts', '/var/www/nexuscut/tailwind.config.ts')
    sftp.close()
    
    commands = [
        'cd /var/www/nexuscut',
        'export PATH=$PATH:/root/.nvm/versions/node/v20.20.2/bin',
        'npm run build',
        'pm2 restart nexuscut --update-env'
    ]
    stdin, stdout, stderr = ssh.exec_command(' && '.join(commands))
    exit_status = stdout.channel.recv_exit_status()
    print('Build exit code:', exit_status)
    print(stdout.read().decode("utf-8", errors="replace").encode("ascii", "ignore").decode("ascii"))
    ssh.close()
except Exception as e:
    print(e)
