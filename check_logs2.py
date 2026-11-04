import paramiko

def check():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    stdin, stdout, stderr = ssh.exec_command('grep -A 5 -B 5 ".next/server/app/api/stripe/checkout-addon/route.js" /root/.pm2/logs/nexuscut-error.log | tail -n 50')
    print("ERROR LOG:")
    print(repr(stdout.read()))
    
    ssh.close()

if __name__ == '__main__':
    check()
