import paramiko
import os

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    # Ensure remote dir exists
    ssh.exec_command('mkdir -p /var/www/nexuscut/secure_assets')
    
    sftp = ssh.open_sftp()
    
    files_to_upload = [
        'growth_mode_guide.pdf',
        'hormozi_template.zip',
        'abdaal_template.zip',
        'gta_backgrounds.zip',
        'asmr_backgrounds.zip'
    ]
    
    for f in files_to_upload:
        local_path = os.path.join('secure_assets', f)
        remote_path = f'/var/www/nexuscut/secure_assets/{f}'
        print(f"Uploading {f}...")
        sftp.put(local_path, remote_path)
        
    sftp.close()
    ssh.close()
    print("All assets uploaded securely to VPS!")
except Exception as e:
    print(e)
