import paramiko

def check():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    sftp = ssh.open_sftp()
    
    print("Uploading Prisma schema...")
    sftp.put('prisma/schema.prisma', '/var/www/nexuscut/prisma/schema.prisma')
    
    print("Uploading webhook route...")
    sftp.put('src/app/api/stripe/webhook/route.ts', '/var/www/nexuscut/src/app/api/stripe/webhook/route.ts')
    
    print("Uploading downloads route...")
    ssh.exec_command('mkdir -p /var/www/nexuscut/src/app/api/downloads')
    sftp.put('src/app/api/downloads/route.ts', '/var/www/nexuscut/src/app/api/downloads/route.ts')
    
    print("Uploading downloads page...")
    ssh.exec_command('mkdir -p /var/www/nexuscut/src/app/downloads')
    sftp.put('src/app/downloads/page.tsx', '/var/www/nexuscut/src/app/downloads/page.tsx')
    
    print("Uploading assets...")
    ssh.exec_command('mkdir -p /var/www/nexuscut/secure_assets')
    sftp.put('secure_assets/hormozi_template.zip', '/var/www/nexuscut/secure_assets/hormozi_template.zip')
    sftp.put('secure_assets/abdaal_template.zip', '/var/www/nexuscut/secure_assets/abdaal_template.zip')
    sftp.put('secure_assets/gta_backgrounds.zip', '/var/www/nexuscut/secure_assets/gta_backgrounds.zip')
    sftp.put('secure_assets/asmr_backgrounds.zip', '/var/www/nexuscut/secure_assets/asmr_backgrounds.zip')
    sftp.put('secure_assets/growth_mode_guide.pdf', '/var/www/nexuscut/secure_assets/growth_mode_guide.pdf')
    
    print("Running prisma db push...")
    stdin, stdout, stderr = ssh.exec_command('cd /var/www/nexuscut && npx prisma db push --accept-data-loss')
    print(stdout.read().decode())
    
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
