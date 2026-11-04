import sys
import paramiko

FILES = [
    'src/pages/api/transcribe.ts',
    'src/app/tools/auto-captions/layout.tsx',
]
ROOT = '/var/www/nexuscut'
ssh = paramiko.SSHClient(); ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''), timeout=30)
sftp = ssh.open_sftp()

def run(cmd, timeout=300):
    _, so, se = ssh.exec_command(cmd, timeout=timeout)
    out = so.read().decode('utf-8', errors='replace')
    err = se.read().decode('utf-8', errors='replace')
    return so.channel.recv_exit_status(), out, err

try:
    for f in FILES:
        sftp.put(f, f'{ROOT}/{f}')
        print('uploaded', f)
    c, o, e = run(f'cd {ROOT} && export PATH=$PATH:/root/.nvm/versions/node/v20.20.2/bin && npm run build > /root/deploy_build.log 2>&1; echo BUILD_EXIT:$?', timeout=1500)
    print(o.strip())
    _, tail, _ = run('tail -12 /root/deploy_build.log')
    print(tail)
    if 'BUILD_EXIT:0' not in o:
        print('BUILD FAILED - pm2 NOT restarted')
        sys.exit(2)
    c, o, e = run('pm2 restart nexuscut --update-env && sleep 5 && curl -s -o /dev/null -w "local http: %{http_code}\n" http://127.0.0.1:3000/')
    print(o)
    print('DEPLOY OK')
finally:
    sftp.close(); ssh.close()
