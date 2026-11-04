import paramiko
import zipfile
import os
import sys

def create_zip():
    print("Creating deploy_ai.zip...")
    zip_path = 'deploy_ai.zip'
    if os.path.exists(zip_path):
        os.remove(zip_path)
    
    exclude_dirs = {'.git', 'node_modules', '.next', 'temp_backup', 'mobile_backup', 'mobile_backup_before_tools', 'screenshots', 'scratch'}
    
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk('.'):
            # modify dirs in-place to skip excluded directories
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            
            for file in files:
                file_path = os.path.join(root, file)
                if file == 'dev.db' or file.endswith('-journal'):
                    continue
                    
                if file.endswith('.zip') or file.endswith('.pdf') or file.endswith('.mp4'):
                    # Allow these files only if they are inside the public directory
                    if 'public' not in root.split(os.sep):
                        continue
                zipf.write(file_path, os.path.relpath(file_path, '.'))
    print(f"Created {zip_path} ({os.path.getsize(zip_path) / 1024 / 1024:.2f} MB)")

def deploy_to_vps():
    host = '209.74.79.56'
    username = 'root'
    password = __import__('os').environ.get('VPS_PASSWORD','')

    print(f'Connecting to {host}...')
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        ssh.connect(host, username=username, password=password)
    except Exception as e:
        print(f"Failed to connect: {e}")
        return

    print("Uploading deploy_ai.zip to VPS...")
    with ssh.open_sftp() as sftp:
        sftp.put("deploy_ai.zip", "/root/deploy_ai.zip")
        # Also upload .env.local
        if os.path.exists(".env.local"):
            print("Uploading .env.local...")
            sftp.put(".env.local", "/root/.env.local")

    print('Executing deployment commands on VPS...')
    commands = """
    cd /var/www/nexuscut
    unzip -o -q /root/deploy_ai.zip -d /var/www/nexuscut
    cp /root/.env.local /var/www/nexuscut/.env.local
    npm install
    npm run build
    cp -r public .next/standalone/ || true
    mkdir -p .next/standalone/.next/static
    cp -r .next/static/* .next/standalone/.next/static/ || true
    cp .env .next/standalone/ || true
    cp .env.local .next/standalone/ || true
    echo '\nDATABASE_URL="file:/var/www/nexuscut/prisma/dev.db"' >> .next/standalone/.env.local
    pm2 restart nexuscut
    """

    stdin, stdout, stderr = ssh.exec_command(commands)
    exit_status = stdout.channel.recv_exit_status()

    print("STDOUT:")
    sys.stdout.buffer.write(stdout.read())
    print("\nSTDERR:")
    sys.stdout.buffer.write(stderr.read())

    print(f'Deployment Finished with exit code {exit_status}')
    ssh.close()

if __name__ == '__main__':
    create_zip()
    deploy_to_vps()
