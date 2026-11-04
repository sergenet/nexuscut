import paramiko

def check():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    stdin, stdout, stderr = ssh.exec_command('tail -n 30 /root/.pm2/logs/nexuscut-error.log')
    print("ERROR LOG:")
    print(stdout.read().decode('utf-8', errors='ignore'))
    
    stdin, stdout, stderr = ssh.exec_command('tail -n 30 /root/.pm2/logs/nexuscut-out.log')
    print("OUT LOG:")
    print(stdout.read().decode('utf-8', errors='ignore'))
    
    ssh.close()

if __name__ == '__main__':
    check()
