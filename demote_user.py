import paramiko

host = '209.74.79.56'
username = 'root'
password = __import__('os').environ.get('VPS_PASSWORD','')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(host, username=username, password=password)

node_script = """
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  await prisma.user.update({
    where: { clerkId: 'local-user' },
    data: { isPro: false }
  });
  console.log('Demoted local-user!');
}
run();
"""

commands = f"""
cd /var/www/nexuscut
cat << 'EOF' > demote.js
{node_script}
EOF
node demote.js
"""

stdin, stdout, stderr = ssh.exec_command(commands)

print("STDOUT:", stdout.read().decode())
print("STDERR:", stderr.read().decode())
ssh.close()
