import paramiko

def check():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    stdin, stdout, stderr = ssh.exec_command('ps aux | grep node')
    print("NODE PROCESSES:")
    print(stdout.read().decode('utf-8'))
    
    stdin, stdout, stderr = ssh.exec_command('pm2 status')
    print("PM2 STATUS:")
    print(stdout.read().decode('utf-8'))
    
    ssh.close()

if __name__ == '__main__':
    check()
