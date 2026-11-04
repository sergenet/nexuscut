import paramiko
import os
import tarfile

def deploy():
    # Create archive
    with tarfile.open('deploy.tar.gz', 'w:gz') as tar:
        tar.add('src/components/Editor/Sidebar.tsx', arcname='src/components/Editor/Sidebar.tsx')
        
    # Connect
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('213.190.4.24', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    # Upload
    sftp = ssh.open_sftp()
    sftp.put('deploy.tar.gz', '/var/www/nexuscut/deploy.tar.gz')
    sftp.close()
    
    # Extract and build
    commands = [
        "cd /var/www/nexuscut && tar -xzf deploy.tar.gz",
        "cd /var/www/nexuscut && export NODE_OPTIONS=--max_old_space_size=2048 && npm run build > build.log 2>&1",
        "cd /var/www/nexuscut && pm2 restart all"
    ]
    
    for cmd in commands:
        print(f"Running: {cmd}")
        stdin, stdout, stderr = ssh.exec_command(cmd)
        exit_status = stdout.channel.recv_exit_status()
        if exit_status != 0:
            print(f"Error: {stderr.read().decode()}")
            if "npm run build" in cmd:
                # read build.log
                stdin, stdout, stderr = ssh.exec_command("cat /var/www/nexuscut/build.log")
                print(stdout.read().decode())
                return
            
    print("Done")

deploy()
