import paramiko

host = '209.74.79.56'
username = 'root'
password = __import__('os').environ.get('VPS_PASSWORD','')

print(f'Connecting to {host}...')
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(host, username=username, password=password)

commands = """
cd /var/www/nexuscut
cp -r public .next/standalone/ || true
cp -r .next/static .next/standalone/.next/ || true
pm2 delete nexuscut || true
PORT=3000 pm2 start .next/standalone/server.js --name "nexuscut"
pm2 save
sleep 3
pm2 logs nexuscut --lines 20 --nostream
"""
print("Running Standalone Fix...")
stdin, stdout, stderr = ssh.exec_command(commands)

out = stdout.read().decode('utf-8', errors='ignore').encode('ascii', 'ignore').decode('ascii')
err = stderr.read().decode('utf-8', errors='ignore').encode('ascii', 'ignore').decode('ascii')

print("STDOUT:")
print(out)
print("STDERR:")
print(err)

ssh.close()
