import paramiko

def check():
    host = '209.74.79.56'
    username = 'root'
    password = __import__('os').environ.get('VPS_PASSWORD','')

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(host, username=username, password=password)

    stdin, stdout, stderr = ssh.exec_command("curl -sI http://localhost:3000/editor")
    print(stdout.read().decode('utf-8'))
    ssh.close()

if __name__ == '__main__':
    check()
