import paramiko
import os

def check():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    stdin, stdout, stderr = ssh.exec_command('pm2 describe nexuscut-ai | grep "script id"')
    out = stdout.read().decode().strip()
    print("Script Path Info:", out)
    
    # Also find the exact path
    stdin, stdout, stderr = ssh.exec_command('pm2 jlist')
    import json
    data = stdout.read().decode()
    try:
        j = json.loads(data)
        for app in j:
            if app['name'] == 'nexuscut-ai':
                print("App Path:", app['pm2_env']['pm_exec_path'])
    except:
        pass
    
    ssh.close()

if __name__ == '__main__':
    check()
