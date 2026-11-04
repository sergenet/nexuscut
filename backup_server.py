import paramiko
import datetime

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    date_str = datetime.datetime.now().strftime("%Y_%m_%d_%H%M%S")
    cmd = f"cd /var/www && tar -czf nexuscut_backup_{date_str}.tar.gz nexuscut"
    
    stdin, stdout, stderr = ssh.exec_command(cmd)
    print("OUTPUT:", stdout.read().decode())
    print("ERROR:", stderr.read().decode())
    
    ssh.close()
    print(f"Successfully backed up server to nexuscut_backup_{date_str}.tar.gz")
except Exception as e:
    print(e)
