import paramiko

def check():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    stdin, stdout, stderr = ssh.exec_command('tail -n 50 /var/www/nexuscut/.next/standalone/server.js')
    print(stdout.read().decode('utf-8'))
    
    ssh.close()

if __name__ == '__main__':
    check()
