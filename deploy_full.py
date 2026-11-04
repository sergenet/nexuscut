import os
import zipfile
import paramiko
import time

def create_zip():
    print('Zipping...')
    with zipfile.ZipFile('deploy_full.zip', 'w', zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk('.'):
            # Exclude directories
            dirs[:] = [d for d in dirs if d not in ['.git', 'node_modules', '.next', 'secure_assets', 'temp_backup', 'temp_extract'] 
                       and not d.startswith('mobile') 
                       and not d.startswith('src_backup') 
                       and not d.startswith('backend_backup')]
            for file in files:
                if file.endswith('.zip') or file == 'deploy_full.zip' or file.endswith('.db') or file == 'nexuscut-error.log':
                    continue
                file_path = os.path.join(root, file)
                zf.write(file_path, arcname=os.path.relpath(file_path, '.'))
    print('Zipped.')

def deploy():
    create_zip()
    print('Uploading...')
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    sftp = ssh.open_sftp()
    sftp.put('deploy_full.zip', '/var/www/nexuscut/deploy_full.zip')
    sftp.close()
    
    print('Unzipping and building...')
    commands = [
        'cd /var/www/nexuscut',
        'unzip -o deploy_full.zip',
        'export PATH=$PATH:/root/.nvm/versions/node/v20.20.2/bin',
        'npm install',
        'npm run build',
        'cp -r public .next/standalone/ || true',
        'cp -r .next/static .next/standalone/.next/ || true',
        'pm2 restart nexuscut --update-env'
    ]
    stdin, stdout, stderr = ssh.exec_command(' && '.join(commands))
    
    exit_status = stdout.channel.recv_exit_status()
    print('Build exit code:', exit_status)
    with open('deploy_out.txt', 'wb') as f:
        f.write(stdout.read())
    with open('deploy_err.txt', 'wb') as f:
        f.write(stderr.read())
        
    ssh.close()
    print('Done.')

if __name__ == '__main__':
    deploy()
