import paramiko

host = '209.74.79.56'
username = 'root'
password = __import__('os').environ.get('VPS_PASSWORD','')

print(f'Connecting to {host}...')
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(host, username=username, password=password)

cmd = "cd /var/www/nexuscut && npm run build"
print(f"Running: {cmd}")
stdin, stdout, stderr = ssh.exec_command(cmd)

out = stdout.read().decode('utf-8', errors='ignore').encode('ascii', 'ignore').decode('ascii')
err = stderr.read().decode('utf-8', errors='ignore').encode('ascii', 'ignore').decode('ascii')

print("STDOUT:")
print(out)
print("STDERR:")
print(err)

ssh.close()
