import paramiko

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    cmd = """
cd /var/www/nexuscut
pm2 stop all
rm -rf .next
npm run build
pm2 start all
"""
    stdin, stdout, stderr = ssh.exec_command(cmd)
    
    # Read output and print cleanly to avoid charmap errors
    out = stdout.read().decode("utf-8", errors="replace")
    print("OUTPUT:")
    print(out.encode("ascii", errors="ignore").decode("ascii"))
    
    err = stderr.read().decode("utf-8", errors="replace")
    print("ERROR:")
    print(err.encode("ascii", errors="ignore").decode("ascii"))
    
    ssh.close()
except Exception as e:
    print("EXCEPTION:", e)
