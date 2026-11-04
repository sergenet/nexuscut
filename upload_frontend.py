import paramiko
import os
import subprocess
import time

host = '209.74.79.56'
username = 'root'
password = __import__('os').environ.get('VPS_PASSWORD','')

print("1. Zipping frontend dist...")
subprocess.run('tar.exe -caf frontend_update.zip -C mobile\\dist .', shell=True, check=True, cwd="C:\\NexusCut")

print("2. Uploading to VPS...")
max_retries = 5
for attempt in range(max_retries):
    try:
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(host, username=username, password=password, timeout=30)
        
        with ssh.open_sftp() as sftp:
            sftp.put("C:\\NexusCut\\frontend_update.zip", "/root/frontend_update.zip")
            
        print("3. Extracting directly to public directory...")
        commands = """
        cd /var/www/nexuscut/public
        unzip -o -q /root/frontend_update.zip -d /var/www/nexuscut/public
        """
        stdin, stdout, stderr = ssh.exec_command(commands)
        exit_status = stdout.channel.recv_exit_status()
        
        print("Deployment Complete!")
        ssh.close()
        break
    except Exception as e:
        print(f"Attempt {attempt + 1} failed: {e}")
        if attempt < max_retries - 1:
            print("Retrying in 5 seconds...")
            time.sleep(5)
        else:
            print("All attempts failed.")
            raise
