import paramiko
try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    script = """
#!/bin/bash
set -e

apt-get update && apt-get install -y zip

cd /root/asset_gen
cd gta_clips && zip -q ../gta_backgrounds.zip *.mp4 && cd ..
cd asmr_clips && zip -q ../asmr_backgrounds.zip *.mp4 && cd ..

mkdir -p /var/www/nexuscut/secure_assets
cp gta_backgrounds.zip /var/www/nexuscut/secure_assets/
cp asmr_backgrounds.zip /var/www/nexuscut/secure_assets/

echo "Fixed and moved!"
"""
    sftp = ssh.open_sftp()
    with sftp.file('/root/fix_zip.sh', 'w') as f:
        f.write(script)
    sftp.close()
    
    stdin, stdout, stderr = ssh.exec_command('bash /root/fix_zip.sh')
    print("OUTPUT:", stdout.read().decode("utf-8", errors="replace"))
    print("ERR:", stderr.read().decode("utf-8", errors="replace"))
    ssh.close()
except Exception as e:
    print(e)
