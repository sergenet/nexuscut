import paramiko

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    stdin, stdout, stderr = ssh.exec_command('tail -n 50 /root/.pm2/logs/nexuscut-out.log /root/.pm2/logs/nexuscut-error.log')
    print("LOGS:", stdout.read().decode("utf-8", errors="replace").encode("ascii", errors="ignore").decode("ascii"))
    
    ssh.close()
except Exception as e:
    print(e)
