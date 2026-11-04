import paramiko
import json

def check():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    stdin, stdout, stderr = ssh.exec_command('pm2 jlist')
    data = stdout.read().decode('utf-8', errors='ignore')
    try:
        j = json.loads(data)
        for app in j:
            if app['name'] == 'nexuscut-ai':
                path = app['pm2_env']['pm_exec_path']
                print("App Path:", path)
                
                # Check contents of that file
                stdin, stdout, stderr = ssh.exec_command(f'cat {path}')
                print("SERVER CODE:")
                print(stdout.read().decode('utf-8', errors='ignore'))
    except Exception as e:
        print("Error:", e)
    
    ssh.close()

if __name__ == '__main__':
    check()
