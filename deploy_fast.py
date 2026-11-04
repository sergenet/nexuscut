import paramiko
import zipfile
import os
import sys
import shutil

def run_local_build():
    print("Copying static assets to standalone...")
    # Copy public
    if os.path.exists("public"):
        shutil.copytree("public", ".next/standalone/public", dirs_exist_ok=True)
    
    # Copy .next/static
    if os.path.exists(".next/static"):
        shutil.copytree(".next/static", ".next/standalone/.next/static", dirs_exist_ok=True)
        
    # Copy env files
    if os.path.exists(".env"):
        shutil.copy2(".env", ".next/standalone/")
    if os.path.exists(".env.local"):
        shutil.copy2(".env.local", ".next/standalone/")

def create_zip():
    print("Zipping standalone build...")
    zip_path = 'standalone_ai.zip'
    if os.path.exists(zip_path):
        os.remove(zip_path)
    
    # We want to zip the contents of .next/standalone/
    base_dir = os.path.join('.next', 'standalone')
    
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(base_dir):
            for file in files:
                file_path = os.path.join(root, file)
                # The path inside the zip should be relative to base_dir
                arcname = os.path.relpath(file_path, base_dir)
                zipf.write(file_path, arcname)
                
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

    print("Uploading standalone_ai.zip to VPS...")
    with ssh.open_sftp() as sftp:
        sftp.put("standalone_ai.zip", "/root/standalone_ai.zip")

    print('Executing deployment commands on VPS...')
    commands = """
    cd /var/www/nexuscut
    unzip -o -q /root/standalone_ai.zip -d /var/www/nexuscut
    pm2 restart nexuscut
    """

    stdin, stdout, stderr = ssh.exec_command(commands)
    exit_status = stdout.channel.recv_exit_status()

    print("STDOUT:")
    print(stdout.read().decode('utf-8', errors='ignore'))
    print("STDERR:")
    print(stderr.read().decode('utf-8', errors='ignore'))

    print(f'Deployment Finished with exit code {exit_status}')
    ssh.close()

if __name__ == '__main__':
    run_local_build()
    create_zip()
    deploy_to_vps()
