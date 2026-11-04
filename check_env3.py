import paramiko

def check():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    stdin, stdout, stderr = ssh.exec_command('cat /var/www/nexuscut/.env')
    output = stdout.read().decode('utf-8')
    
    for line in output.split('\n'):
        if '=' in line:
            key, val = line.split('=', 1)
            print(f"{key}={val[:8]}...")
            
    ssh.close()
    print("Done")

if __name__ == '__main__':
    check()
