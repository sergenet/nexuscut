import paramiko

host = '209.74.79.56'
username = 'root'
password = __import__('os').environ.get('VPS_PASSWORD','')

print(f'Connecting to {host}...')
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    ssh.connect(host, username=username, password=password)
except Exception as e:
    print(f"Failed to connect: {e}")
    exit(1)

commands = [
    "systemctl status nginx --no-pager",
    "nginx -t",
    "cat /etc/nginx/sites-available/nexuscut",
    "pm2 status",
    "pm2 logs nexuscut --lines 20 --nostream"
]

for cmd in commands:
    print(f"\\n=== Running: {cmd} ===")
    stdin, stdout, stderr = ssh.exec_command(cmd)
    
    out = stdout.read().decode('utf-8', errors='ignore').encode('ascii', 'ignore').decode('ascii')
    err = stderr.read().decode('utf-8', errors='ignore').encode('ascii', 'ignore').decode('ascii')
    
    if out.strip():
        print(out.strip())
    if err.strip():
        print("STDERR:", err.strip())

ssh.close()
