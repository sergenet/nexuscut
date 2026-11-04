import paramiko
try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    stdin, stdout, stderr = ssh.exec_command('ls -lah /root/asset_gen/gta_clips/ && ls -lah /root/asset_gen/asmr_clips/ || true')
    print("FILES:", stdout.read().decode("utf-8", errors="replace"))
    ssh.close()
except Exception as e:
    print(e)
