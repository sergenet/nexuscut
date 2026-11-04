import paramiko

def check():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    stdin, stdout, stderr = ssh.exec_command('ls -la /var/www/nexuscut/.next/standalone/')
    print("LS STANDALONE:")
    print(stdout.read().decode('utf-8'))
    
    stdin, stdout, stderr = ssh.exec_command('ls -la /var/www/nexuscut/.next/')
    print("LS .NEXT:")
    print(stdout.read().decode('utf-8'))
    
    ssh.close()

if __name__ == '__main__':
    check()
