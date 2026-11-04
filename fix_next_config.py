import paramiko
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))

config = """const nextConfig = {
  output: 'standalone',
  serverExternalPackages: ['@ffmpeg-installer/ffmpeg'],
  images: {
    unoptimized: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '500mb',
    },
  },
};
export default nextConfig;
"""

stdin, stdout, stderr = ssh.exec_command(f'cat <<EOF > /var/www/nexuscut/next.config.mjs\n{config}\nEOF')
stdout.read()

stdin, stdout, stderr = ssh.exec_command('rm -f /var/www/nexuscut/next.config.ts')
stdout.read()

stdin, stdout, stderr = ssh.exec_command('cd /var/www/nexuscut && npm run build')
out = stdout.read().decode('utf-8', errors='replace')
err = stderr.read().decode('utf-8', errors='replace')

print(out)
print(err)

ssh.exec_command('pm2 restart nexuscut')
