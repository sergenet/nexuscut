import paramiko
try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    stdin, stdout, stderr = ssh.exec_command("grep -q 'orientation: landscape) and (max-width: 1023px)' /var/www/nexuscut/src/components/Editor/Canvas.tsx && echo canvas-update-present; grep -q 'Add media' /var/www/nexuscut/src/components/Editor/MobileActionBar.tsx && echo media-action-present; pm2 pid nexuscut")
    print("STDOUT:", stdout.read().decode("utf-8", errors="replace"))
    ssh.close()
except Exception as e:
    print(e)
