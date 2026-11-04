import paramiko
try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    commands = [
        'cd /var/www/nexuscut',
        'export PATH=$PATH:/root/.nvm/versions/node/v20.20.2/bin',
        'npm uninstall @tailwindcss/postcss tailwindcss @tailwindcss/typography',
        'npm install tailwindcss@3.4.1 postcss autoprefixer @tailwindcss/typography@0.5.10',
        'cat << EOF > postcss.config.mjs\nexport default { plugins: { tailwindcss: {}, autoprefixer: {} } };\nEOF',
        'cat << EOF > tailwind.config.ts\nimport type { Config } from "tailwindcss";\nexport default { content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"], theme: { extend: {} }, plugins: [require("@tailwindcss/typography")] } satisfies Config;\nEOF',
        'cat << EOF > src/app/globals.css\n@tailwind base;\n@tailwind components;\n@tailwind utilities;\n:root { --background: #ffffff; --foreground: #171717; }\n@media (prefers-color-scheme: dark) { :root { --background: #0a0a0a; --foreground: #ededed; } }\nbody { background: var(--background); color: var(--foreground); font-family: Arial, Helvetica, sans-serif; }\n.custom-scrollbar::-webkit-scrollbar { width: 6px; }\n.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }\n.custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(255, 255, 255, 0.1); border-radius: 10px; }\n.custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(255, 255, 255, 0.2); }\nEOF',
        'npm run build',
        'pm2 restart nexuscut --update-env',
        'ls -la /var/www/nexuscut/.next/static/css'
    ]
    stdin, stdout, stderr = ssh.exec_command(' && '.join(commands))
    exit_status = stdout.channel.recv_exit_status()
    print('Build exit code:', exit_status)
    print("STDOUT:", stdout.read().decode("utf-8", errors="replace").encode("ascii", "ignore").decode("ascii"))
    print("STDERR:", stderr.read().decode("utf-8", errors="replace").encode("ascii", "ignore").decode("ascii"))
    ssh.close()
except Exception as e:
    print(e)
