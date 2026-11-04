import paramiko

def deploy():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    print("Pulling from git...")
    stdin, stdout, stderr = ssh.exec_command('cd /var/www/nexuscut && git pull')
    print(stdout.read().decode('utf-8'))
    
    print("Building Next.js app...")
    build_cmd = 'cd /var/www/nexuscut && export PATH=$PATH:/root/.nvm/versions/node/v20.20.2/bin && npm run build'
    stdin, stdout, stderr = ssh.exec_command(build_cmd)
    
    exit_status = stdout.channel.recv_exit_status()
    print("Build exit code:", exit_status)
    if exit_status != 0:
        print(stdout.read().decode('utf-8'))
        print(stderr.read().decode('utf-8'))
    
    print("Restarting PM2...")
    stdin, stdout, stderr = ssh.exec_command('pm2 restart nexuscut --update-env')
    
    ssh.close()
    print("Done")

if __name__ == '__main__':
    deploy()
