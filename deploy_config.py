import paramiko

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    sftp = ssh.open_sftp()
    # Next.js only ever reads next.config.mjs; the .ts copy was dead weight and has
    # been deleted from the project (commit bf402c6). Upload the config that is
    # actually read, and remove the stale remote .ts so it cannot reappear as a
    # duplicate that silently shadows nothing.
    sftp.put(r"next.config.mjs", '/var/www/nexuscut/next.config.mjs')
    try:
        sftp.remove('/var/www/nexuscut/next.config.ts')
        print("Removed stale remote next.config.ts")
    except IOError:
        pass  # already gone - the normal case
    sftp.close()
    
    stdin, stdout, stderr = ssh.exec_command('cd /var/www/nexuscut && npm run build && pm2 restart all')
    out = stdout.read().decode("utf-8", errors="replace")
    print(out.encode("ascii", errors="ignore").decode("ascii"))
    
    ssh.close()
    print("Deployed config successfully.")
except Exception as e:
    print(e)
