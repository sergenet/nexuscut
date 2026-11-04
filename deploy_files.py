import paramiko
import os

files_to_upload = [
    r"src\components\Navigation.tsx",
    r"src\components\Footer.tsx",
    r"src\app\sitemap.ts",
    r"src\app\api\waitlist\route.ts",
    r"src\app\products\desktop\page.tsx",
    r"src\app\products\pad\page.tsx",
    r"src\app\products\mobile\page.tsx"
]

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    sftp = ssh.open_sftp()
    for local_file in files_to_upload:
        remote_file = '/var/www/nexuscut/' + local_file.replace('\\', '/')
        print(f"Uploading {local_file} to {remote_file}")
        sftp.put(local_file, remote_file)
        
    sftp.close()
    
    print("Deleting online waitlist dir...")
    ssh.exec_command('rm -rf /var/www/nexuscut/src/app/products/online')

    print("Building next.js app...")
    stdin, stdout, stderr = ssh.exec_command('cd /var/www/nexuscut && npm run build && pm2 restart all')
    print("OUTPUT:", stdout.read().decode("utf-8", errors="replace"))
    
    ssh.close()
    print("Deployed successfully.")
except Exception as e:
    print(e)
