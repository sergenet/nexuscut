import paramiko

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    stdin, stdout, stderr = ssh.exec_command('sqlite3 /var/www/nexuscut/dev.db "SELECT count(*) FROM WaitlistEntry"')
    print("COUNT IN /var/www/nexuscut/dev.db:", stdout.read().decode("utf-8", errors="replace").strip())

    stdin, stdout, stderr = ssh.exec_command('sqlite3 /var/www/nexuscut/prisma/dev.db "SELECT count(*) FROM WaitlistEntry"')
    print("COUNT IN /var/www/nexuscut/prisma/dev.db:", stdout.read().decode("utf-8", errors="replace").strip())

    ssh.close()
except Exception as e:
    print(e)
