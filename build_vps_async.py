import paramiko

def check():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    print("Starting build...")
    stdin, stdout, stderr = ssh.exec_command('cd /var/www/nexuscut && NODE_OPTIONS="--max-old-space-size=1536" npm run build')
    
    with open('build_output_async.txt', 'w', encoding='utf-8') as f:
        f.write(stdout.read().decode('utf-8', errors='ignore'))
        f.write("\nERRORS:\n")
        f.write(stderr.read().decode('utf-8', errors='ignore'))
        
    ssh.close()
    print("Build done")

if __name__ == '__main__':
    check()
