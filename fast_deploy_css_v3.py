import paramiko
try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    sftp = ssh.open_sftp()
    sftp.put('src/app/globals.css', '/var/www/nexuscut/src/app/globals.css')
    sftp.put('tailwind.config.ts', '/var/www/nexuscut/tailwind.config.ts')
    sftp.put('postcss.config.mjs', '/var/www/nexuscut/postcss.config.mjs')
    sftp.put('package.json', '/var/www/nexuscut/package.json')
    sftp.put('package-lock.json', '/var/www/nexuscut/package-lock.json')
    sftp.close()
    
    commands = [
        'cd /var/www/nexuscut',
        'export PATH=$PATH:/root/.nvm/versions/node/v20.20.2/bin',
        'npm ci',
        'npm run build',
        'pm2 restart nexuscut --update-env',
        'ls -la /var/www/nexuscut/.next/static/css'
    ]
    stdin, stdout, stderr = ssh.exec_command(' && '.join(commands))
    exit_status = stdout.channel.recv_exit_status()
    print('Build exit code:', exit_status)
    print("STDOUT:", stdout.read().decode("utf-8", errors="replace").encode("ascii", "ignore").decode("ascii"))
    print("STDERR:", stderr.read().decode("utf-8", errors="replace").encode("ascii", "ignore").decode("ascii"))
    ssh.close()
except Exception as e:
    print(e)
