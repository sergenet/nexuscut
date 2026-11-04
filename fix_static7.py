import paramiko
try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    commands = [
        'cp -r /var/www/nexuscut/.next/static /var/www/nexuscut/.next/standalone/.next/',
        'cp -r /var/www/nexuscut/public /var/www/nexuscut/.next/standalone/ || true',
        'pm2 restart nexuscut'
    ]
    stdin, stdout, stderr = ssh.exec_command(' && '.join(commands))
    print("EXIT:", stdout.channel.recv_exit_status())
    ssh.close()
except Exception as e:
    print(e)
