import paramiko
try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    commands = [
        'cd /var/www/nexuscut',
        'export PATH=$PATH:/root/.nvm/versions/node/v20.20.2/bin',
        'cat << EOF > next.config.ts\nimport type { NextConfig } from "next";\n\nconst nextConfig: NextConfig = {\n  output: "standalone",\n  serverExternalPackages: ["@ffmpeg-installer/ffmpeg"],\n  experimental: {\n    serverActions: {\n      bodySizeLimit: "500mb",\n    },\n  },\n};\n\nexport default nextConfig;\nEOF',
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
