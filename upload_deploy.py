import paramiko

host = '209.74.79.56'
username = 'root'
password = __import__('os').environ.get('VPS_PASSWORD','')

print("Uploading to VPS...")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(host, username=username, password=password)

with ssh.open_sftp() as sftp:
    sftp.put("C:\\NexusCut\\deploy_ai.zip", "/root/deploy_ai.zip")

print("Installing Python Dependencies on VPS...")
# Install rembg and opencv-python on the VPS
ssh.exec_command("pip3 install rembg opencv-python --break-system-packages || pip3 install rembg opencv-python")

print("Extracting and restarting PM2...")
commands = """
cd /var/www/nexuscut
unzip -o -q /root/deploy_ai.zip -d /var/www/nexuscut
pm2 restart nexuscut
"""
stdin, stdout, stderr = ssh.exec_command(commands)
exit_status = stdout.channel.recv_exit_status()

print("STDOUT:", stdout.read().decode('utf-8', errors='ignore'))
print("Deployment Complete!")
ssh.close()
