import paramiko

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    script = """
cd /var/www/nexuscut
sed -i 's/email     String   @unique/email     String/g' prisma/schema.prisma
if ! grep -q "@@unique(\[email, product\])" prisma/schema.prisma; then
  sed -i '/createdAt DateTime @default(now())/a \ \ @@unique([email, product])' prisma/schema.prisma
fi
npx prisma db push
pm2 restart all
"""
    sftp = ssh.open_sftp()
    with sftp.file('/root/update_prisma.sh', 'w') as f:
        f.write(script)
    sftp.close()
    
    stdin, stdout, stderr = ssh.exec_command('bash /root/update_prisma.sh')
    print("OUTPUT:", stdout.read().decode("utf-8", errors="replace"))
    print("ERR:", stderr.read().decode("utf-8", errors="replace"))
    ssh.close()
except Exception as e:
    print(e)
