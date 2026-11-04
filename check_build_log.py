import paramiko

def check():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    stdin, stdout, stderr = ssh.exec_command('cd /var/www/nexuscut && export PATH=$PATH:/root/.nvm/versions/node/v20.20.2/bin && npm run build')
    
    with open("build_stdout.txt", "w", encoding="utf-8") as f:
        f.write(stdout.read().decode('utf-8', errors='ignore'))
        
    with open("build_stderr.txt", "w", encoding="utf-8") as f:
        f.write(stderr.read().decode('utf-8', errors='ignore'))
    
    ssh.close()
    print("Done")

if __name__ == '__main__':
    check()
