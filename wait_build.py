import paramiko
import time
import sys

def check():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    while True:
        stdin, stdout, stderr = ssh.exec_command('ps aux | grep "npm run build"')
        out = stdout.read().decode('utf-8')
        if "next build" not in out and "npm run build" not in out.replace('grep "npm run build"', ''):
            print("Build finished!")
            break
        print("Still building...")
        time.sleep(5)
        
    ssh.close()

if __name__ == '__main__':
    check()
