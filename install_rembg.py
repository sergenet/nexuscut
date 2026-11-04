import paramiko

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    print("Updating apt and installing python3-pip...")
    stdin, stdout, stderr = ssh.exec_command('apt-get update && apt-get install -y python3-pip')
    print("APT OUT:", stdout.read().decode("utf-8", errors="replace"))
    
    print("Installing rembg via pip3...")
    stdin, stdout, stderr = ssh.exec_command('pip3 install rembg pillow opencv-python-headless --break-system-packages')
    print("PIP OUT:", stdout.read().decode("utf-8", errors="replace"))
    print("PIP ERR:", stderr.read().decode("utf-8", errors="replace"))
    
    ssh.close()
except Exception as e:
    print(e)
