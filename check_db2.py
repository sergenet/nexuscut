import paramiko

def check():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    stdin, stdout, stderr = ssh.exec_command('''
    cd /var/www/nexuscut && node -e "
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    async function main() {
        const p = await prisma.purchase.findMany();
        console.log('Purchases:', p);
        const u = await prisma.user.findMany();
        console.log('Users:', u);
    }
    main().catch(console.error).finally(() => prisma.\());
    "
    ''')
    print(stdout.read().decode('utf-8'))
    print(stderr.read().decode('utf-8'))
    
    ssh.close()
    print("Done")

if __name__ == '__main__':
    check()
