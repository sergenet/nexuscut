import paramiko
import time
import sys
import io

# Force UTF-8 for stdout
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

host = '209.74.79.56'
username = 'root'
password = __import__('os').environ.get('VPS_PASSWORD','')

print(f'Connecting to {host}...')
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(host, username=username, password=password)

print('Fixing dpkg if broken...')
ssh.exec_command('dpkg --configure -a')
time.sleep(2)

print('Executing deployment script again (skipping apt if done)...')
stdin, stdout, stderr = ssh.exec_command('chmod +x /root/deploy_vps.sh && /root/deploy_vps.sh')

# Stream the output
while not stdout.channel.exit_status_ready():
    if stdout.channel.recv_ready():
        print(stdout.channel.recv(1024).decode('utf-8', errors='replace'), end='')
    if stderr.channel.recv_stderr_ready():
        print(stderr.channel.recv_stderr(1024).decode('utf-8', errors='replace'), end='', file=sys.stderr)
    time.sleep(0.5)

# Print any remaining output
print(stdout.read().decode('utf-8', errors='replace'))
print(stderr.read().decode('utf-8', errors='replace'), file=sys.stderr)

exit_status = stdout.channel.recv_exit_status()
print(f'Deployment finished with exit code {exit_status}')
ssh.close()
