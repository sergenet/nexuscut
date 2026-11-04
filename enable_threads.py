import paramiko

host = '209.74.79.56'
username = 'root'
password = __import__('os').environ.get('VPS_PASSWORD','')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(host, username=username, password=password)

print("Connected. Checking Nginx config...")
# Find the config file
commands = """
cat /etc/nginx/sites-available/default
"""
stdin, stdout, stderr = ssh.exec_command(commands)
config = stdout.read().decode()

if "Cross-Origin-Opener-Policy" not in config:
    print("Headers not found, adding them...")
    new_config = config.replace(
        "location / {", 
        "location / {\n        add_header Cross-Origin-Opener-Policy same-origin;\n        add_header Cross-Origin-Embedder-Policy require-corp;"
    )
    
    # Write back
    sftp = ssh.open_sftp()
    with sftp.file('/etc/nginx/sites-available/default', 'w') as f:
        f.write(new_config)
    
    # Reload nginx
    ssh.exec_command("systemctl reload nginx")
    print("Nginx reloaded.")
else:
    print("Headers already exist!")

ssh.close()
