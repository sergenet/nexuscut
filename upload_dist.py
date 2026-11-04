import paramiko, io, tarfile

host = '209.74.79.56'
username = 'root'
password = __import__('os').environ.get('VPS_PASSWORD','')

print('Connecting...')
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(host, username=username, password=password)

sftp = ssh.open_sftp()

print('Creating archive from local dist...')
buf = io.BytesIO()
with tarfile.open(fileobj=buf, mode='w:gz') as tar:
    tar.add(r'C:\NexusCut\mobile\dist', arcname='dist')
buf.seek(0)

print(f'Archive size: {buf.getbuffer().nbytes / 1024 / 1024:.1f} MB')
print('Uploading...')
sftp.putfo(buf, '/root/mobile_dist.tar.gz')
sftp.close()

print('Extracting on server...')
stdin, stdout, stderr = ssh.exec_command(
    'rm -rf /var/www/nexuscut/mobile/dist && '
    'mkdir -p /var/www/nexuscut/mobile && '
    'tar -xzf /root/mobile_dist.tar.gz -C /var/www/nexuscut/mobile/'
)
code = stdout.channel.recv_exit_status()
err = stderr.read().decode('utf-8', errors='ignore').encode('ascii', 'ignore').decode()
print(f'Extract code: {code}')
if err: print('ERR:', err)

print('Done! Site updated.')
ssh.close()
