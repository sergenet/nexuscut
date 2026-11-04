import paramiko
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def build():
    host = '209.74.79.56'
    username = 'root'
    password = __import__('os').environ.get('VPS_PASSWORD','')

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(host, username=username, password=password)

    print("Cleaning .next directory and rebuilding...")
    stdin, stdout, stderr = ssh.exec_command("cd /var/www/nexuscut && rm -rf .next && npm run build")
    exit_status = stdout.channel.recv_exit_status()
    print("Build Exit Status:", exit_status)

    print("Restarting pm2...")
    stdin, stdout, stderr = ssh.exec_command("cd /var/www/nexuscut && pm2 restart nexuscut")
    exit_status = stdout.channel.recv_exit_status()
    print("Restart Exit Status:", exit_status)
    
    ssh.close()

if __name__ == '__main__':
    build()
