import paramiko
try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    sftp = ssh.open_sftp()
    
    sftp.put('C:\\NexusCut\\src\\components\\Editor\\Sidebar.tsx', '/var/www/nexuscut/src/components/Editor/Sidebar.tsx')
    sftp.close()
    
    commands = [
        'cd /var/www/nexuscut',
        'export PATH=$PATH:/root/.nvm/versions/node/v20.20.2/bin',
        'rm -rf .next',
        'npm run build',
        'cp -r .next/static .next/standalone/.next/',
        'cp -r public .next/standalone/ || true',
        'pm2 restart nexuscut --update-env'
    ]
    stdin, stdout, stderr = ssh.exec_command(' && '.join(commands))
    exit_status = stdout.channel.recv_exit_status()
    print('Build exit code:', exit_status)
    ssh.close()
except Exception as e:
    print(e)
