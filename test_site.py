import paramiko

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    stdin, stdout, stderr = ssh.exec_command('curl -s http://localhost:3000/products/desktop | grep "lucide-react" -A 5')
    out = stdout.read().decode("utf-8", errors="replace")
    print("OUTPUT:", out)
    
    stdin, stdout, stderr = ssh.exec_command('pm2 status')
    print("PM2:", stdout.read().decode("utf-8", errors="replace").encode("ascii", errors="ignore").decode("ascii"))
    
    ssh.close()
except Exception as e:
    print(e)
