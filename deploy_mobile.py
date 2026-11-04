import paramiko

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))

    sftp = ssh.open_sftp()
    try:
        sftp.mkdir('/var/www/nexuscut/src/app/creator-challenge')
    except IOError:
        pass
    for remote_dir in [
        '/var/www/nexuscut/src/app/api/admin',
        '/var/www/nexuscut/src/app/api/admin/soro',
        '/var/www/nexuscut/src/app/api/admin/soro/config',
        '/var/www/nexuscut/src/app/api/admin/soro/import',
        '/var/www/nexuscut/src/app/api/marketing/founding-testers',
        '/var/www/nexuscut/public/blog',
        '/var/www/nexuscut/public/ffmpeg',
    ]:
        try:
            sftp.mkdir(remote_dir)
        except IOError:
            pass
    
    sftp.put('src/components/VideoEditor.tsx', '/var/www/nexuscut/src/components/VideoEditor.tsx')
    sftp.put('public/ffmpeg/ffmpeg-core.js', '/var/www/nexuscut/public/ffmpeg/ffmpeg-core.js')
    sftp.put('public/ffmpeg/ffmpeg-core.wasm', '/var/www/nexuscut/public/ffmpeg/ffmpeg-core.wasm')
    sftp.put('src/app/editor/page.tsx', '/var/www/nexuscut/src/app/editor/page.tsx')
    sftp.put('src/app/page.tsx', '/var/www/nexuscut/src/app/page.tsx')
    sftp.put('src/components/Navigation.tsx', '/var/www/nexuscut/src/components/Navigation.tsx')
    sftp.put('src/app/creator-challenge/page.tsx', '/var/www/nexuscut/src/app/creator-challenge/page.tsx')
    sftp.put('src/components/FoundingTesterForm.tsx', '/var/www/nexuscut/src/components/FoundingTesterForm.tsx')
    sftp.put('src/components/ProConversionTracking.tsx', '/var/www/nexuscut/src/components/ProConversionTracking.tsx')
    sftp.put('src/app/pro/page.tsx', '/var/www/nexuscut/src/app/pro/page.tsx')
    sftp.put('src/app/api/marketing/founding-testers/route.ts', '/var/www/nexuscut/src/app/api/marketing/founding-testers/route.ts')
    sftp.put('src/lib/metaConversions.ts', '/var/www/nexuscut/src/lib/metaConversions.ts')
    sftp.put('src/app/blog/[slug]/page.tsx', '/var/www/nexuscut/src/app/blog/[slug]/page.tsx')
    sftp.put('src/app/blog/page.tsx', '/var/www/nexuscut/src/app/blog/page.tsx')
    sftp.put('src/app/sitemap.ts', '/var/www/nexuscut/src/app/sitemap.ts')
    sftp.put('src/app/layout.tsx', '/var/www/nexuscut/src/app/layout.tsx')
    sftp.put('src/components/GoogleAnalytics.tsx', '/var/www/nexuscut/src/components/GoogleAnalytics.tsx')
    sftp.put('src/components/RecoverPurchases.tsx', '/var/www/nexuscut/src/components/RecoverPurchases.tsx')
    sftp.put('src/lib/analytics.ts', '/var/www/nexuscut/src/lib/analytics.ts')
    sftp.put('src/lib/blogData.ts', '/var/www/nexuscut/src/lib/blogData.ts')
    sftp.put('src/components/Editor/Sidebar.tsx', '/var/www/nexuscut/src/components/Editor/Sidebar.tsx')
    sftp.put('src/components/Editor/CaptionEditorModal.tsx', '/var/www/nexuscut/src/components/Editor/CaptionEditorModal.tsx')
    sftp.put('src/components/Editor/PropertiesPanel.tsx', '/var/www/nexuscut/src/components/Editor/PropertiesPanel.tsx')
    sftp.put('src/components/Editor/FeedbackModal.tsx', '/var/www/nexuscut/src/components/Editor/FeedbackModal.tsx')
    sftp.put('next.config.mjs', '/var/www/nexuscut/next.config.mjs')
    sftp.put('tsconfig.json', '/var/www/nexuscut/tsconfig.json')
    sftp.put('src/components/Editor/MobileBottomSheet.tsx', '/var/www/nexuscut/src/components/Editor/MobileBottomSheet.tsx')
    sftp.put('src/components/Editor/MobileActionBar.tsx', '/var/www/nexuscut/src/components/Editor/MobileActionBar.tsx')
    sftp.put('src/components/Editor/Canvas.tsx', '/var/www/nexuscut/src/components/Editor/Canvas.tsx')
    sftp.put('src/components/Editor/Timeline/Timeline.tsx', '/var/www/nexuscut/src/components/Editor/Timeline/Timeline.tsx')
    sftp.put('src/components/Editor/Timeline/VideoThumbnails.tsx', '/var/www/nexuscut/src/components/Editor/Timeline/VideoThumbnails.tsx')
    sftp.put('src/store/useEditorStore.ts', '/var/www/nexuscut/src/store/useEditorStore.ts')
    sftp.put('src/lib/exportQueue.ts', '/var/www/nexuscut/src/lib/exportQueue.ts')
    sftp.put('src/pages/api/export.ts', '/var/www/nexuscut/src/pages/api/export.ts')
    sftp.put('src/pages/api/export/download.ts', '/var/www/nexuscut/src/pages/api/export/download.ts')
    sftp.put('src/app/api/stripe/checkout/route.ts', '/var/www/nexuscut/src/app/api/stripe/checkout/route.ts')
    sftp.put('src/app/api/stripe/webhook/route.ts', '/var/www/nexuscut/src/app/api/stripe/webhook/route.ts')
    sftp.put('src/app/api/user/me/route.ts', '/var/www/nexuscut/src/app/api/user/me/route.ts')
    sftp.put('src/app/api/brand-kit/route.ts', '/var/www/nexuscut/src/app/api/brand-kit/route.ts')
    sftp.put('src/app/brand-kit/page.tsx', '/var/www/nexuscut/src/app/brand-kit/page.tsx')
    sftp.put('src/app/pricing/page.tsx', '/var/www/nexuscut/src/app/pricing/page.tsx')
    sftp.put('src/app/admin/page.tsx', '/var/www/nexuscut/src/app/admin/page.tsx')
    sftp.put('src/app/api/admin/soro/config/route.ts', '/var/www/nexuscut/src/app/api/admin/soro/config/route.ts')
    sftp.put('src/app/api/admin/soro/import/route.ts', '/var/www/nexuscut/src/app/api/admin/soro/import/route.ts')
    sftp.put('src/lib/adminAuth.ts', '/var/www/nexuscut/src/lib/adminAuth.ts')
    sftp.put('src/lib/soroRss.ts', '/var/www/nexuscut/src/lib/soroRss.ts')
    sftp.put('scripts/migrate-creator-tier.js', '/var/www/nexuscut/scripts/migrate-creator-tier.js')
    sftp.put('scripts/migrate-soro-drafts.sql', '/var/www/nexuscut/scripts/migrate-soro-drafts.sql')
    sftp.put('scripts/migrate-founding-testers.sql', '/var/www/nexuscut/scripts/migrate-founding-testers.sql')
    sftp.put('prisma/schema.prisma', '/var/www/nexuscut/prisma/schema.prisma')
    sftp.put('package.json', '/var/www/nexuscut/package.json')
    sftp.put('server.js', '/var/www/nexuscut/server.js')
    sftp.put('public/blog/ai-powered-short-form-video-editor-workflow.png', '/var/www/nexuscut/public/blog/ai-powered-short-form-video-editor-workflow.png')
    sftp.close()
    
    cmd = """
cd /var/www/nexuscut
npx prisma generate
npx prisma db execute --file scripts/migrate-soro-drafts.sql --schema prisma/schema.prisma
npx prisma db execute --file scripts/migrate-founding-testers.sql --schema prisma/schema.prisma
npm run migrate:creator-tier
npm run build
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/
pm2 restart nexuscut
"""
    stdin, stdout, stderr = ssh.exec_command(cmd)
    
    print("OUTPUT:", stdout.read().decode("utf-8", errors="replace").encode("ascii", errors="ignore").decode("ascii"))
    
    ssh.close()
except Exception as e:
    print(e)
