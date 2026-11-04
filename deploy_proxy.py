import paramiko
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def deploy():
    host = '209.74.79.56'
    username = 'root'
    password = __import__('os').environ.get('VPS_PASSWORD','')

    files_to_upload = [
        'src/proxy.ts'
    ]

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(host, username=username, password=password)

    sftp = ssh.open_sftp()
    
    for file_path in files_to_upload:
        print(f"Uploading {file_path}...")
        local_path = f"C:/NexusCut/{file_path}"
        remote_path = f"/var/www/nexuscut/{file_path}"
        
        remote_dir = "/".join(remote_path.split("/")[:-1])
        ssh.exec_command(f"mkdir -p {remote_dir}")
        
        sftp.put(local_path, remote_path)

    sftp.close()

    print("Executing deployment commands on VPS...")
    commands = (
        "cd /var/www/nexuscut && "
        "rm -rf .next && "
        "npm run build && "
        "cp -r .next/static .next/standalone/.next/ && "
        "cp -r public .next/standalone/ && "
        "pm2 restart nexuscut"
    )
    
    stdin, stdout, stderr = ssh.exec_command(commands)
    exit_status = stdout.channel.recv_exit_status()
    print("Exit Status:", exit_status)
    print("STDOUT:", stdout.read().decode('utf-8', errors='ignore'))
    print("STDERR:", stderr.read().decode('utf-8', errors='ignore'))

    ssh.close()

if __name__ == '__main__':
    deploy()
