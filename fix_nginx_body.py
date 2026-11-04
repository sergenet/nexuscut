import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))

script = """
grep -q "client_max_body_size" /etc/nginx/nginx.conf || sed -i '/http {/a \\    client_max_body_size 500M;' /etc/nginx/nginx.conf
sed -i 's/client_max_body_size.*/client_max_body_size 500M;/g' /etc/nginx/nginx.conf
systemctl restart nginx
"""
stdin, stdout, stderr = ssh.exec_command(script)
print("OUT:", stdout.read().decode())
print("ERR:", stderr.read().decode())
ssh.close()
