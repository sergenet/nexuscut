import paramiko
import re
import sys

def check():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    server_path = '/var/www/nexuscut/.next/standalone/server.js'
    sftp = ssh.open_sftp()
    
    try:
        with sftp.open(server_path, 'r') as f:
            content = f.read().decode('utf-8')
            
        if 'currentServer.listen(' in content:
            new_content = content.replace('currentServer.listen(', 'currentServer.timeout = 3600000; currentServer.keepAliveTimeout = 3600000; currentServer.listen(')
            with sftp.open(server_path, 'w') as f:
                f.write(new_content)
            print("Successfully patched currentServer.listen in server.js!")
            ssh.exec_command('pm2 restart nexuscut')
            print("Restarted PM2")
        else:
            print("Could not find currentServer.listen either. Let's print out the file:")
            print(content[:500])
    except Exception as e:
        print("Error:", e)

    ssh.close()

if __name__ == '__main__':
    check()
