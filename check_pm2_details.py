import paramiko
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def check():
    host = '209.74.79.56'
    username = 'root'
    password = __import__('os').environ.get('VPS_PASSWORD','')

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(host, username=username, password=password)

    stdin, stdout, stderr = ssh.exec_command("pm2 show nexuscut")
    print(stdout.read().decode('utf-8', errors='ignore'))
    
    ssh.close()

if __name__ == '__main__':
    check()
