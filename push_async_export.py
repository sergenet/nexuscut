import paramiko
import os

def push():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    sftp = ssh.open_sftp()
    
    files_to_push = [
        ('C:/NexusCut/src/pages/api/export.ts', '/var/www/nexuscut/src/pages/api/export.ts'),
        ('C:/NexusCut/src/pages/api/export/status.ts', '/var/www/nexuscut/src/pages/api/export/status.ts'),
        ('C:/NexusCut/src/pages/api/export/download.ts', '/var/www/nexuscut/src/pages/api/export/download.ts'),
        ('C:/NexusCut/src/components/VideoEditor.tsx', '/var/www/nexuscut/src/components/VideoEditor.tsx')
    ]
    
    # Create directory on VPS
    try:
        sftp.mkdir('/var/www/nexuscut/src/pages/api/export')
    except:
        pass
        
    for local_path, remote_path in files_to_push:
        print(f"Uploading {local_path} -> {remote_path}")
        sftp.put(local_path, remote_path)
        
    sftp.close()
    ssh.close()
    print("Upload complete.")

if __name__ == '__main__':
    push()
