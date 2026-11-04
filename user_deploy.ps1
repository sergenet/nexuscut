Write-Host "Creating deployment archive..."
tar.exe -czf deploy.tar.gz src/app/downloads/page.tsx src/app/account/page.tsx src/app/affiliates/dashboard/page.tsx src/app/robots.ts
Write-Host "Uploading to VPS..."
scp.exe deploy.tar.gz root@209.74.79.56:/var/www/nexuscut/deploy.tar.gz
Write-Host "Extracting and building on VPS..."
ssh.exe root@209.74.79.56 "cd /var/www/nexuscut && tar -xzf deploy.tar.gz && export NODE_OPTIONS=--max_old_space_size=2048 && npm run build && pm2 restart all"
Write-Host "Deployment complete!"
