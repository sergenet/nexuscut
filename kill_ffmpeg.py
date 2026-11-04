import paramiko

def check():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    ssh.exec_command('pkill -f ffmpeg')
    print("Killed FFmpeg processes")
    
    ssh.close()

if __name__ == '__main__':
    check()
