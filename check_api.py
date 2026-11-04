import paramiko

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    stdin, stdout, stderr = ssh.exec_command('cat /var/www/nexuscut/src/app/api/waitlist/route.ts | grep email_product -A 5')
    print("API:", stdout.read().decode("utf-8", errors="replace"))
    
    ssh.close()
except Exception as e:
    print(e)
