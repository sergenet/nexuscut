import paramiko

def check():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    stdin, stdout, stderr = ssh.exec_command('pm2 describe nexuscut')
    out = stdout.read().decode('utf-8', errors='ignore')
    for line in out.splitlines():
        if 'exec_cwd' in line or 'exec mode' in line or 'script path' in line:
            print(line.strip())

    ssh.close()

if __name__ == '__main__':
    check()
