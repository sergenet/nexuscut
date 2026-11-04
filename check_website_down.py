import paramiko

def check():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    stdin, stdout, stderr = ssh.exec_command('pm2 logs nexuscut --lines 100 --nostream')
    out = stdout.read().decode('utf-8', errors='ignore')
    with open('vps_down_logs.txt', 'w', encoding='utf-8') as f:
        f.write(out)
        
    ssh.close()

if __name__ == '__main__':
    check()
