import paramiko
try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    sftp = ssh.open_sftp()
    
    # Write local next.config.ts and upload it
    with open("next.config.ts", "w") as f:
        f.write("""import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['@ffmpeg-installer/ffmpeg'],
  experimental: {
    serverActions: {
      bodySizeLimit: '500mb',
    },
  },
};

export default nextConfig;
""")
    sftp.put('next.config.ts', '/var/www/nexuscut/next.config.ts')
    sftp.close()
    
    commands = [
        'cd /var/www/nexuscut',
        'export PATH=$PATH:/root/.nvm/versions/node/v20.20.2/bin',
        'rm -rf .next',
        'npm run build',
        'cp -r .next/static .next/standalone/.next/',
        'cp -r public .next/standalone/ || true',
        'pm2 restart nexuscut --update-env'
    ]
    stdin, stdout, stderr = ssh.exec_command(' && '.join(commands))
    exit_status = stdout.channel.recv_exit_status()
    print('Build exit code:', exit_status)
    print("STDOUT:", stdout.read().decode("utf-8", errors="replace").encode("ascii", "ignore").decode("ascii"))
    print("STDERR:", stderr.read().decode("utf-8", errors="replace").encode("ascii", "ignore").decode("ascii"))
    ssh.close()
except Exception as e:
    print(e)
