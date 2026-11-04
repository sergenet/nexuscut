import paramiko

def check():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    sftp = ssh.open_sftp()
    
    print("Uploading success page...")
    sftp.put('src/app/marketplace/success/page.tsx', '/var/www/nexuscut/src/app/marketplace/success/page.tsx')
    
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
