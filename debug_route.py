import paramiko

def debug():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    # Check the actual file content on the VPS
    stdin, stdout, stderr = ssh.exec_command('cat /var/www/nexuscut/src/app/api/auth/recover/route.ts')
    print(stdout.read().decode('utf-8'))
    
    ssh.close()
    print("Done")

if __name__ == '__main__':
    debug()
