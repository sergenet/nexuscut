import paramiko
import textwrap

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))

next_config = """
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },
  turbopack: {},
  experimental: {
    workerThreads: false,
    cpus: 1,
    memoryBasedWorkersCount: true,
  }
};
export default nextConfig;
"""

sftp = ssh.open_sftp()
with sftp.file('/var/www/nexuscut/next.config.mjs', 'w') as f:
    f.write(next_config)
sftp.close()

print("Building...")
stdin, stdout, stderr = ssh.exec_command('export NODE_OPTIONS="--max-old-space-size=2048" && cd /var/www/nexuscut && npm run build')
out = stdout.read()
err = stderr.read()

with open('vps_build_out.txt', 'wb') as f:
    f.write(out)
with open('vps_build_err.txt', 'wb') as f:
    f.write(err)

ssh.exec_command('pm2 restart nexuscut')
print("Done!")
