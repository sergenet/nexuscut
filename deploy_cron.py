import paramiko

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    # Run once a week at 10 AM on Fridays
    cron_cmd = '(crontab -l 2>/dev/null; echo "0 10 * * 5 /usr/bin/node /var/www/nexuscut/scripts/newsletter.js >> /var/www/nexuscut/scripts/newsletter.log 2>&1") | crontab -'
    
    stdin, stdout, stderr = ssh.exec_command(cron_cmd)
    print("CRON Setup Complete.")
    ssh.close()
except Exception as e:
    print(e)
