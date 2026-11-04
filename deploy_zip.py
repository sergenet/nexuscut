import paramiko

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    sftp = ssh.open_sftp()
    
    # upload the zip
    sftp.put('public/templates/script-pack.zip', '/var/www/nexuscut/public/templates/script-pack.zip')
    sftp.put('public/templates/script-pack.zip', '/var/www/nexuscut/.next/standalone/public/templates/script-pack.zip')
    sftp.close()
    print("Upload complete")
    
    ssh.close()
except Exception as e:
    print(e)
