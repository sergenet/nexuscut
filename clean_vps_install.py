import paramiko

host = '209.74.79.56'
username = 'root'
password = __import__('os').environ.get('VPS_PASSWORD','')

print(f'Connecting to {host}...')
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(host, username=username, password=password)

commands = """
node -v
npm -v
cd /var/www/nexuscut
rm -rf node_modules package-lock.json
npm install
npm run build
"""

print("Running clean install and build...")
stdin, stdout, stderr = ssh.exec_command(commands)

out = stdout.read().decode('utf-8', errors='ignore').encode('ascii', 'ignore').decode('ascii')
err = stderr.read().decode('utf-8', errors='ignore').encode('ascii', 'ignore').decode('ascii')

print("STDOUT:")
print(out)
print("STDERR:")
print(err)

ssh.close()
