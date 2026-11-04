import paramiko

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    stdin, stdout, stderr = ssh.exec_command('curl -X POST -H "Content-Type: application/json" -d \'{"email":"test2@test.com", "product":"NexusCut Pad"}\' http://localhost:3000/api/waitlist')
    print("API RESPONSE 1:", stdout.read().decode("utf-8", errors="replace"))
    
    stdin, stdout, stderr = ssh.exec_command('curl -X POST -H "Content-Type: application/json" -d \'{"email":"test2@test.com", "product":"NexusCut Mobile"}\' http://localhost:3000/api/waitlist')
    print("API RESPONSE 2:", stdout.read().decode("utf-8", errors="replace"))

    ssh.close()
except Exception as e:
    print(e)
