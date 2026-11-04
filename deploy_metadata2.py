import paramiko
import os

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    os.system("tar.exe -czf src.tar.gz src")
    
    sftp = ssh.open_sftp()
    sftp.put('src.tar.gz', '/var/www/nexuscut/src.tar.gz')
    sftp.close()
    
    commands = [
        'cd /var/www/nexuscut',
        'tar -xzf src.tar.gz',
        'export PATH=$PATH:/root/.nvm/versions/node/v20.20.2/bin',
        'rm -rf .next',
        'npm run build',
        'cp -r .next/static .next/standalone/.next/',
        'cp -r public .next/standalone/ || true',
        'pm2 restart nexuscut'
    ]
    stdin, stdout, stderr = ssh.exec_command(' && '.join(commands))
    exit_status = stdout.channel.recv_exit_status()
    print('Deploy exit code:', exit_status)
    ssh.close()
except Exception as e:
    print(e)
