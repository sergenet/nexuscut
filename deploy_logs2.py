import paramiko
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def check_pm2():
    host = '209.74.79.56'
    username = 'root'
    password = __import__('os').environ.get('VPS_PASSWORD','')

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(host, username=username, password=password)

    stdin, stdout, stderr = ssh.exec_command("pm2 logs --lines 50 --nostream")
    out = stdout.read().decode('utf-8', errors='ignore')
    print(out)
    ssh.close()

if __name__ == '__main__':
    check_pm2()
