import paramiko
import os

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    sftp = ssh.open_sftp()
    
    files_to_upload = [
        'hormozi_template.zip',
        'abdaal_template.zip'
    ]
    
    for f in files_to_upload:
        if os.path.exists(f):
            print(f"Uploading {f}...")
            sftp.put(f, f'/var/www/nexuscut/secure_assets/{f}')
        
    sftp.close()
    ssh.close()
    print("Kits uploaded securely to VPS!")
except Exception as e:
    print(e)
