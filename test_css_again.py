import paramiko
import re

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    stdin, stdout, stderr = ssh.exec_command('curl -s http://localhost:3000/')
    html = stdout.read().decode("utf-8", errors="replace")
    
    css_links = re.findall(r'href="(/_next/static/chunks/[^"]+\.css)"', html)
    print("CSS Links:", css_links)
    
    if css_links:
        for link in css_links:
            stdin, stdout, stderr = ssh.exec_command(f'curl -s -o /dev/null -w "%{{http_code}}" http://localhost:3000{link}')
            print(f"Node HTTP status for {link}:", stdout.read().decode("utf-8").strip())

    ssh.close()
except Exception as e:
    print(e)
