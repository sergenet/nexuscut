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
            
        # We need to find where http.createServer is or just set the timeout on the server object.
        # server.js usually has: const server = http.createServer(...)
        # or const server = new Server(...)
        
        # We can just append server.timeout = 3600000; server.keepAliveTimeout = 3600000; before server.listen
        if 'server.listen(' in content:
            new_content = content.replace('server.listen(', 'server.timeout = 3600000; server.keepAliveTimeout = 3600000; server.listen(')
            with sftp.open(server_path, 'w') as f:
                f.write(new_content)
            print("Successfully patched server.js!")
            ssh.exec_command('pm2 restart nexuscut')
            print("Restarted PM2")
        else:
            print("Could not find server.listen in server.js")
    except Exception as e:
        print("Error:", e)

    ssh.close()

if __name__ == '__main__':
    check()
