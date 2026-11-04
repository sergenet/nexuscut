import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''), timeout=20)

cmd = """
echo "=== Old Secure Assets (GTA) ==="
ffprobe -v error -show_entries stream=width,height,bit_rate -of csv=p=0 /root/asset_gen/gta_clips/gta_bg_0.mp4 || true

echo "=== Marketplace Files (Racing) ==="
ffprobe -v error -show_entries stream=width,height,bit_rate -of csv=p=0 "/var/www/nexuscut/marketplace-files/bg-gameplay-loops/AI created cinematic racing visuals.mp4" || true

echo "=== Marketplace Files (Satisfying) ==="
ffprobe -v error -show_entries stream=width,height,bit_rate -of csv=p=0 "/var/www/nexuscut/marketplace-files/bg-satisfying-loops/Project 1.mp4" || true
"""

stdin, stdout, stderr = ssh.exec_command(cmd)
print(stdout.read().decode('ascii', errors='ignore'))
ssh.close()
