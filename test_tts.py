import paramiko
import json

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    # send a request to localhost:3000/api/tts
    cmd = """
curl -s -D - -X POST http://localhost:3000/api/tts \
-H "Content-Type: application/json" \
-H "x-device-fingerprint: test-fingerprint-123" \
-d '{"text":"hello world","voice":"nova"}' \
-o tts_test.mp3
"""
    stdin, stdout, stderr = ssh.exec_command(cmd)
    
    headers = stdout.read().decode("utf-8", errors="replace")
    print("HEADERS:")
    print(headers)
    
    # Check file size
    stdin, stdout, stderr = ssh.exec_command('ls -l tts_test.mp3; file tts_test.mp3')
    print("FILE INFO:")
    print(stdout.read().decode("utf-8", errors="replace"))
    
    ssh.close()
except Exception as e:
    print(e)
