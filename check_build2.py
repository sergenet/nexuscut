import paramiko

def check():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    print("Running build to get error...")
    stdin, stdout, stderr = ssh.exec_command('cd /var/www/nexuscut && NODE_OPTIONS="--max-old-space-size=1536" npm run build')
    
    output = stdout.read().decode('utf-8', 'ignore')
    
    print("BUILD OUTPUT:")
    print(repr(output[-2000:]))
    
    ssh.close()

if __name__ == '__main__':
    check()
