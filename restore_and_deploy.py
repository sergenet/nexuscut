import os
import shutil
import tarfile
import paramiko

def restore_and_deploy():
    print("Restoring src from src_backup_2026-08-02_23-42-07...")
    src_dir = 'C:\\NexusCut\\src'
    backup_dir = 'C:\\NexusCut\\src_backup_2026-08-02_23-42-07'
    
    if os.path.exists(src_dir):
        shutil.rmtree(src_dir)
    
    shutil.copytree(backup_dir, src_dir)
    print("Restored!")
    
    print("Creating deployment archive...")
    with tarfile.open('deploy_full.tar.gz', 'w:gz') as tar:
        tar.add('src', arcname='src')
    
    print("Connecting to VPS...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''), timeout=15)
    
    sftp = ssh.open_sftp()
    print("Uploading...")
    sftp.put('deploy_full.tar.gz', '/var/www/nexuscut/deploy_full.tar.gz')
    sftp.close()
    
    print("Deploying on VPS...")
    commands = [
        "cd /var/www/nexuscut && tar -xzf deploy_full.tar.gz",
        "cd /var/www/nexuscut && rm -rf .next build.log",
        "cd /var/www/nexuscut && export NODE_OPTIONS=--max_old_space_size=2048 && npm run build > build.log 2>&1",
        "cd /var/www/nexuscut && pm2 restart all"
    ]
    
    for cmd in commands:
        print(f"Running: {cmd}")
        stdin, stdout, stderr = ssh.exec_command(cmd)
        exit_status = stdout.channel.recv_exit_status()
        if exit_status != 0:
            print(f"Error: {stderr.read().decode('utf-8', errors='ignore')}")
            # Try to read build log if build failed
            if "npm run build" in cmd:
                _, blog, _ = ssh.exec_command("cat /var/www/nexuscut/build.log")
                print(blog.read().decode('utf-8', errors='ignore'))
            break
            
    ssh.close()
    print("Done")

if __name__ == '__main__':
    restore_and_deploy()
