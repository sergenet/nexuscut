import paramiko
import json

def check():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    stdin, stdout, stderr = ssh.exec_command('pm2 jlist')
    output = stdout.read().decode('utf-8')
    try:
        data = json.loads(output)
        for app in data:
            if app['name'] == 'nexuscut':
                env = app['pm2_env']
                print("SMTP_HOST:", env.get('SMTP_HOST'))
                print("SMTP_USER:", env.get('SMTP_USER'))
                break
    except Exception as e:
        print("Error parsing PM2 json:", e)
    
    ssh.close()
    print("Done")

if __name__ == '__main__':
    check()
