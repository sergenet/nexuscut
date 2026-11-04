import paramiko

def check():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    ssh.exec_command('grep -rn -i "error" /root/.pm2/logs/nexuscut-error.log | tail -n 20 > /tmp/e1.txt')
    ssh.exec_command('grep -rn -i "error" /root/.pm2/logs/nexuscut-out.log | tail -n 20 > /tmp/e2.txt')
    
    stdin, stdout, stderr = ssh.exec_command('cat /tmp/e1.txt | tr -cd "\\11\\12\\15\\40-\\176"')
    print("Error Log:", stdout.read().decode('utf-8'))
    
    stdin, stdout, stderr = ssh.exec_command('cat /tmp/e2.txt | tr -cd "\\11\\12\\15\\40-\\176"')
    print("Out Log:", stdout.read().decode('utf-8'))
    
    ssh.close()
    print("Done")

if __name__ == '__main__':
    check()
