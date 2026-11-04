import paramiko

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    # 1. Install rembg on the VPS
    print("Installing rembg...")
    ssh.exec_command('pip3 install rembg pillow opencv-python-headless --break-system-packages')
    
    # 2. Update route.ts to use python3
    sftp = ssh.open_sftp()
    
    cmd = """
cd /var/www/nexuscut
# update route.ts to use python3
sed -i 's/`python ${pythonScript}/`python3 ${pythonScript}/g' src/app/api/smart-tools/remove-bg-image/route.ts
npm run build
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/
# copy src/ai to standalone/src/ai
mkdir -p .next/standalone/src/ai
cp -r src/ai/* .next/standalone/src/ai/
pm2 restart nexuscut
"""
    print("Building and deploying...")
    stdin, stdout, stderr = ssh.exec_command(cmd)
    
    print("OUTPUT:", stdout.read().decode("utf-8", errors="replace").encode("ascii", errors="ignore").decode("ascii"))
    print("ERROR:", stderr.read().decode("utf-8", errors="replace").encode("ascii", errors="ignore").decode("ascii"))
    
    ssh.close()
except Exception as e:
    print(e)
