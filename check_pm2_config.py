import paramiko
import json
try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    stdin, stdout, stderr = ssh.exec_command('pm2 jlist')
    out = stdout.read().decode("utf-8")
    apps = json.loads(out)
    for app in apps:
        if app["name"] == "nexuscut":
            print("PM2 script:", app["pm2_env"]["pm_exec_path"])
    ssh.close()
except Exception as e:
    print(e)
