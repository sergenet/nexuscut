#!/bin/bash
set -e

echo "=== Updating System ==="
apt-get update
DEBIAN_FRONTEND=noninteractive apt-get upgrade -y

echo "=== Installing Dependencies ==="
DEBIAN_FRONTEND=noninteractive apt-get install -y curl git build-essential ffmpeg nginx certbot python3-certbot-nginx

echo "=== Installing Node.js 20 ==="
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
DEBIAN_FRONTEND=noninteractive apt-get install -y nodejs

echo "=== Installing PM2 ==="
npm install -g pm2

echo "=== Setting up Application Directory ==="
rm -rf /var/www/nexuscut
mkdir -p /var/www/nexuscut
cd /var/www/nexuscut

echo "=== Cloning Repository ==="
git clone https://github.com/sergenet/nexuscut.git .

echo "=== Writing Environment Variables ==="
cat << 'EOF' > .env.local
OPENAI_API_KEY=LOCAL_REPLACE_OPENAI
PEXELS_API_KEY=LOCAL_REPLACE_PEXELS
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=LOCAL_REPLACE_CLERK_PUB
CLERK_SECRET_KEY=LOCAL_REPLACE_CLERK_SEC
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=LOCAL_REPLACE_STRIPE_PUB
STRIPE_SECRET_KEY=LOCAL_REPLACE_STRIPE_SEC
PORT=3000
EOF

echo "=== Installing NPM Packages ==="
npm install

echo "=== Building Next.js App ==="
npm run build

echo "=== Starting App with PM2 ==="
pm2 stop nexuscut || true
pm2 delete nexuscut || true
pm2 start npm --name "nexuscut" -- start
pm2 save
pm2 startup systemd -u root --hp /root || true

echo "=== Configuring Nginx ==="
cat << 'EOF' > /etc/nginx/sites-available/nexuscut
server {
    listen 80;
    server_name nexuscut.io www.nexuscut.io 209.74.79.56;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \System.Management.Automation.Internal.Host.InternalHost;
        proxy_cache_bypass \;
        
        # Allow large file uploads for mobile streaming
        client_max_body_size 2000M;
    }
}
EOF

ln -sf /etc/nginx/sites-available/nexuscut /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
systemctl restart nginx

echo "=== Deployment Complete! ==="
