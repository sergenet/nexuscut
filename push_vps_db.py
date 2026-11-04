import paramiko
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def check():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    # Upload local schema.prisma to VPS to ensure it's the exact same
    sftp = ssh.open_sftp()
    sftp.put('C:/NexusCut/prisma/schema.prisma', '/var/www/nexuscut/prisma/schema.prisma')
    sftp.close()
    
    # Force Prisma to push to the absolute path database
    stdin, stdout, stderr = ssh.exec_command('cd /var/www/nexuscut && export DATABASE_URL="file:/var/www/nexuscut/dev.db" && npx prisma db push --accept-data-loss')
    print("STDOUT:", stdout.read().decode('utf-8', errors='ignore'))
    print("STDERR:", stderr.read().decode('utf-8', errors='ignore'))
    
    ssh.exec_command('pm2 restart nexuscut')
    
    ssh.close()

if __name__ == '__main__':
    check()
