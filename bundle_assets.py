import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''), timeout=20)

commands = """
cd /var/www/nexuscut/secure_assets
rm -rf temp_bundle
mkdir -p "temp_bundle/Satisfying Loops" "temp_bundle/Gameplay Loops"
unzip -q asmr_backgrounds.zip -d "temp_bundle/Satisfying Loops"
unzip -q gta_backgrounds.zip -d "temp_bundle/Gameplay Loops"
cd temp_bundle
zip -q -r ../all_access_background_bundle.zip .
cd ..
rm -rf temp_bundle
ls -lh all_access_background_bundle.zip
"""

stdin, stdout, stderr = ssh.exec_command(commands)
out = stdout.read().decode('ascii', errors='ignore')
err = stderr.read().decode('ascii', errors='ignore')
print("STDOUT:", out)
if err:
    print("STDERR:", err)
ssh.close()
