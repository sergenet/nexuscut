import paramiko
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
stdin, stdout, stderr = ssh.exec_command('ls -la /var/www/nexuscut')
with open('vps_ls.txt', 'wb') as f:
    f.write(stdout.read())
