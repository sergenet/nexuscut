import paramiko

def check():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    stdin, stdout, stderr = ssh.exec_command('ls -la /var/www/nexuscut/.next/')
    print("NEXT DIR:")
    print(stdout.read().decode('utf-8'))
    
    stdin, stdout, stderr = ssh.exec_command('cat /var/www/nexuscut/.next/build-manifest.json | grep -i error')
    out = stdout.read().decode('utf-8')
    if out:
        print("BUILD MANIFEST ERROR:", out)
        
    ssh.close()

if __name__ == '__main__':
    check()
