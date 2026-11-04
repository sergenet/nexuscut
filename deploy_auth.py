import paramiko
import os

def check():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    sftp = ssh.open_sftp()
    
    files_to_upload = [
        'prisma/schema.prisma',
        'src/app/api/stripe/webhook/route.ts',
        'src/app/api/auth/recover/route.ts',
        'src/app/api/auth/verify/route.ts',
        'src/components/RecoverPurchases.tsx',
        'src/app/downloads/page.tsx',
        'package.json',
        'package-lock.json'
    ]
    
    for file_path in files_to_upload:
        local_path = os.path.join('C:\\\\NexusCut', file_path.replace('/', '\\\\'))
        remote_path = f'/var/www/nexuscut/{file_path}'
        
        # Ensure remote directory exists
        remote_dir = os.path.dirname(remote_path)
        ssh.exec_command(f'mkdir -p {remote_dir}')
        
        try:
            print(f'Uploading {local_path} to {remote_path}')
            sftp.put(local_path, remote_path)
        except Exception as e:
            print(f'Error uploading {file_path}: {e}')
            
    sftp.close()
    
    print("Running npm install and build...")
    stdin, stdout, stderr = ssh.exec_command('cd /var/www/nexuscut && npm ci && npx prisma generate && npx prisma db push --accept-data-loss && NODE_OPTIONS="--max-old-space-size=1536" npm run build')
    
    # Wait for the command to finish
    exit_status = stdout.channel.recv_exit_status()
    print("Build exit code:", exit_status)
    if exit_status != 0:
        print("Error output:", stderr.read().decode('utf-8'))
        
    print("Restarting PM2...")
    ssh.exec_command('cp -r /var/www/nexuscut/public /var/www/nexuscut/.next/standalone/public && cp -r /var/www/nexuscut/.next/static /var/www/nexuscut/.next/standalone/.next/static && pm2 restart nexuscut')
    
    ssh.close()
    print("Done")

if __name__ == '__main__':
    check()
