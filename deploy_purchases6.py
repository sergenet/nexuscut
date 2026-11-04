import paramiko

def check():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    sftp = ssh.open_sftp()
    
    print("Uploading full Prisma schema...")
    sftp.put('prisma/schema.prisma', '/var/www/nexuscut/prisma/schema.prisma')
    
    print("Running prisma db push...")
    ssh.exec_command('cd /var/www/nexuscut && npx prisma db push --accept-data-loss')
    
    print("Running prisma generate...")
    stdin, stdout, stderr = ssh.exec_command('cd /var/www/nexuscut && npx prisma generate')
    print("Generate exit code:", stdout.channel.recv_exit_status())
    
    print("Running build...")
    stdin, stdout, stderr = ssh.exec_command('cd /var/www/nexuscut && NODE_OPTIONS="--max-old-space-size=1536" npm run build')
    print("Build exit code:", stdout.channel.recv_exit_status())
    
    print("Restarting PM2...")
    ssh.exec_command('cp -r /var/www/nexuscut/public /var/www/nexuscut/.next/standalone/public && cp -r /var/www/nexuscut/.next/static /var/www/nexuscut/.next/standalone/.next/static && pm2 restart nexuscut')
    
    sftp.close()
    ssh.close()
    print("Done")

if __name__ == '__main__':
    check()
