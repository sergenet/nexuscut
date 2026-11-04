import sys, time
import paramiko

ssh = paramiko.SSHClient(); ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''), timeout=30)

def run(cmd, timeout=300):
    _, so, se = ssh.exec_command(cmd, timeout=timeout)
    out = so.read().decode('utf-8', errors='replace')
    err = se.read().decode('utf-8', errors='replace')
    return so.channel.recv_exit_status(), out, err

try:
    c, o, e = run('rm /var/www/nexuscut/src/middleware.ts && echo REMOVED')
    print(o.strip() or e.strip())
    c, o, e = run('cd /var/www/nexuscut && export PATH=$PATH:/root/.nvm/versions/node/v20.20.2/bin && npm run build > /root/deploy_build.log 2>&1; echo BUILD_EXIT:$?', timeout=1500)
    print(o.strip())
    _, tail, _ = run('tail -20 /root/deploy_build.log')
    print(tail)
    if 'BUILD_EXIT:0' not in o:
        print('BUILD FAILED - old site still serving')
        sys.exit(2)
    c, o, e = run('pm2 restart nexuscut --update-env && sleep 5 && pm2 status | head -10', timeout=120)
    print(o)
    _, st, _ = run("curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000/")
    print('local http:', st)
    print('DEPLOY OK')
finally:
    ssh.close()
