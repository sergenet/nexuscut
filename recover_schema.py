import paramiko

def check():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    # Prisma generates the client and puts a copy of schema.prisma there
    stdin, stdout, stderr = ssh.exec_command('cat /var/www/nexuscut/node_modules/.prisma/client/schema.prisma')
    output = stdout.read().decode('utf-8')
    print("RECOVERED SCHEMA:")
    print(output)
    
    ssh.close()

if __name__ == '__main__':
    check()
