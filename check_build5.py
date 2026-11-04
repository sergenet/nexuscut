import paramiko

def check():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    stdin, stdout, stderr = ssh.exec_command('cd /var/www/nexuscut && NODE_OPTIONS="--max-old-space-size=1536" npm run build > build_err3.txt 2>&1')
    exit_code = stdout.channel.recv_exit_status()
    
    sftp = ssh.open_sftp()
    sftp.get('/var/www/nexuscut/build_err3.txt', 'C:\\NexusCut\\build_err3.txt')
    sftp.close()
    ssh.close()
    print("Done")

if __name__ == '__main__':
    check()
