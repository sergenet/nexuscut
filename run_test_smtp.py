import paramiko

def check():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    sftp = ssh.open_sftp()
    sftp.put('C:\\\\NexusCut\\\\test_smtp.js', '/tmp/test_smtp.js')
    sftp.close()
    
    stdin, stdout, stderr = ssh.exec_command('cd /var/www/nexuscut && node /tmp/test_smtp.js')
    print(stdout.read().decode('utf-8'))
    print(stderr.read().decode('utf-8'))
    
    ssh.close()
    print("Done")

if __name__ == '__main__':
    check()
