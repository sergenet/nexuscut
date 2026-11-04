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
        const u = await prisma.user.findUnique({
            where: { id: '4cc63768-2008-4158-9e99-d14e1890902d' }
        });
        console.log('User for purchase:', u);
        const users = await prisma.user.findMany();
        console.log('All users:', users.map(u => u.clerkId));
    }
    main().catch(console.error);
    "
    ''')
    print(stdout.read().decode('utf-8'))
    print(stderr.read().decode('utf-8'))
    
    ssh.close()
    print("Done")

if __name__ == '__main__':
    check()
