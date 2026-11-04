import paramiko
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

host = '209.74.79.56'
username = 'root'
password = __import__('os').environ.get('VPS_PASSWORD','')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(host, username=username, password=password)

print('--- Searching JS chunks for almost done ---')
stdin, stdout, stderr = ssh.exec_command('grep -rl "almost done" /var/www/nexuscut/.next/static/')
print(stdout.read().decode('utf-8', errors='replace'))

print('--- Searching JS chunks for Transcribing via OpenAI Whisper... ---')
stdin, stdout, stderr = ssh.exec_command('grep -rl "Transcribing via OpenAI Whisper..." /var/www/nexuscut/.next/static/')
print(stdout.read().decode('utf-8', errors='replace'))

ssh.close()
