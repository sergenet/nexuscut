import paramiko

def check():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    stdin, stdout, stderr = ssh.exec_command('cd /var/www/nexuscut && NODE_OPTIONS="--max-old-space-size=1536" npm run build > build_output.log 2>&1')
    
    ssh.close()

if __name__ == '__main__':
    check()
