import paramiko
try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    sftp = ssh.open_sftp()
    
    # Upload to both public directories
    sftp.put('C:\\NexusCut\\public\\BingSiteAuth.xml', '/var/www/nexuscut/public/BingSiteAuth.xml')
    try:
        sftp.put('C:\\NexusCut\\public\\BingSiteAuth.xml', '/var/www/nexuscut/.next/standalone/public/BingSiteAuth.xml')
    except Exception:
        pass # Directory might not exist if running differently, but we handle it in ssh cmd
    sftp.close()
    
    # Restart PM2 just to be safe, though static files in standalone/public usually don't need a restart
    commands = [
        'mkdir -p /var/www/nexuscut/.next/standalone/public',
        'cp /var/www/nexuscut/public/BingSiteAuth.xml /var/www/nexuscut/.next/standalone/public/BingSiteAuth.xml',
        'pm2 restart nexuscut'
    ]
    stdin, stdout, stderr = ssh.exec_command(' && '.join(commands))
    exit_status = stdout.channel.recv_exit_status()
    print('Deploy exit code:', exit_status)
    ssh.close()
except Exception as e:
    print(e)
