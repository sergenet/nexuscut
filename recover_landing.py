import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))

# The landing.html is still in the last deployed dist on the server
# Let's grab it back
sftp = ssh.open_sftp()
sftp.get('/var/www/nexuscut/mobile/dist/landing.html', r'C:\NexusCut\mobile\public\landing.html')
sftp.close()
print('Downloaded landing.html from server')

ssh.close()
