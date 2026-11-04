import paramiko

def check():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    # Get last 100 lines of pm2 logs for nexuscut
    stdin, stdout, stderr = ssh.exec_command('pm2 logs nexuscut --lines 100 --nostream')
    out = stdout.read().decode('utf-8', errors='ignore')
    print(out)
    
    # Also check if there's any ffmpeg error log
    stdin, stdout, stderr = ssh.exec_command('cat /var/www/nexuscut/ffmpeg-error.log')
    err_log = stdout.read().decode('utf-8', errors='ignore')
    if err_log:
        print("FFMPEG ERROR LOG:", err_log)

    ssh.close()

if __name__ == '__main__':
    check()
