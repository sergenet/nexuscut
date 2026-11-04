import paramiko

def check():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    ssh.exec_command('pm2 logs nexuscut --lines 50 --nostream > /tmp/nexuscut_logs_3.txt')
    
    stdin, stdout, stderr = ssh.exec_command('cat /tmp/nexuscut_logs_3.txt | tr -cd "\\11\\12\\15\\40-\\176"')
    print(stdout.read().decode('utf-8'))
    
    ssh.close()
    print("Done")

if __name__ == '__main__':
    check()
