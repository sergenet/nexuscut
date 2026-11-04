import paramiko
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def check():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    stdin, stdout, stderr = ssh.exec_command('pm2 logs nexuscut --lines 50 --nostream')
    out = stdout.read().decode('utf-8', errors='ignore')
    
    # Save to a local file
    with open('vps_logs.txt', 'w', encoding='utf-8') as f:
        f.write(out)
        
    ssh.close()

if __name__ == '__main__':
    check()
