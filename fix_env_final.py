import paramiko

host = '209.74.79.56'
username = 'root'
password = __import__('os').environ.get('VPS_PASSWORD','')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(host, username=username, password=password)

commands = """
cd /var/www/nexuscut
cp .env .next/standalone/ || true
cp .env.local .next/standalone/ || true
pm2 restart nexuscut
"""
ssh.exec_command(commands)
ssh.close()
