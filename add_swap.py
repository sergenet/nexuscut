import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))

commands = [
    'fallocate -l 4G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=4096',
    'chmod 600 /swapfile',
    'mkswap /swapfile',
    'swapon /swapfile',
    'echo "/swapfile none swap sw 0 0" >> /etc/fstab',
    'free -m'
]

for cmd in commands:
    print(f"Running: {cmd}")
    stdin, stdout, stderr = ssh.exec_command(cmd)
    out = stdout.read().decode()
    if out: print(out)
    err = stderr.read().decode()
    if err: print('ERR:', err)

ssh.close()
