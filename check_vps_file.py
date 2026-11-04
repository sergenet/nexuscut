import paramiko

def check():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    stdin, stdout, stderr = ssh.exec_command('cat /var/www/nexuscut/src/app/downloads/page.tsx')
    output = stdout.read().decode('utf-8')
    print("DOWNLOADS PAGE:", len(output), "bytes")
    
    stdin, stdout, stderr = ssh.exec_command('cat /var/www/nexuscut/src/app/marketplace/success/page.tsx')
    output2 = stdout.read().decode('utf-8')
    print("SUCCESS PAGE:", len(output2), "bytes")
    
    ssh.close()
    print("Done")

if __name__ == '__main__':
    check()
