import paramiko

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    script = """
#!/bin/bash
set -e

mkdir -p /root/asset_gen
cd /root/asset_gen

echo "Downloading GTA..."
wget -qO gta_src.mp4 "https://archive.org/download/GrandTheftAutoSA_746/GrandTheftAutoSA_746_LQ_part04_512kb.mp4" || echo "Failed to download GTA"

echo "Downloading ASMR..."
wget -qO asmr_src.mp4 "https://archive.org/download/17MostRelaxingSlimeVideos02SatisfyingASMR/17-Most%20Relaxing%20Slime%20Videos%20%2302%20%28Satisfying%20ASMR%29.mp4" || echo "Failed to download ASMR"

mkdir -p gta_clips asmr_clips

echo "Processing GTA clips..."
for i in {0..9}; do
    start_time=$((i * 15))
    ffmpeg -y -ss $start_time -i gta_src.mp4 -t 15 -vf "crop=ih*9/16:ih,scale=1080:1920,setsar=1" -c:a copy gta_clips/gta_bg_$i.mp4 -v quiet -hide_banner || echo "FFMPEG fail"
done

echo "Processing ASMR clips..."
for i in {0..9}; do
    start_time=$((i * 15))
    ffmpeg -y -ss $start_time -i asmr_src.mp4 -t 15 -vf "crop=ih*9/16:ih,scale=1080:1920,setsar=1" -c:a copy asmr_clips/asmr_bg_$i.mp4 -v quiet -hide_banner || echo "FFMPEG fail"
done

echo "Zipping..."
cd gta_clips && zip -q ../gta_backgrounds.zip *.mp4 && cd ..
cd asmr_clips && zip -q ../asmr_backgrounds.zip *.mp4 && cd ..

echo "Moving to secure_assets..."
mkdir -p /var/www/nexuscut/secure_assets
cp gta_backgrounds.zip /var/www/nexuscut/secure_assets/
cp asmr_backgrounds.zip /var/www/nexuscut/secure_assets/

echo "Done!"
"""
    sftp = ssh.open_sftp()
    with sftp.file('/root/build_assets.sh', 'w') as f:
        f.write(script)
    sftp.close()
    
    stdin, stdout, stderr = ssh.exec_command('bash /root/build_assets.sh')
    print("OUTPUT:", stdout.read().decode("utf-8", errors="replace"))
    print("ERR:", stderr.read().decode("utf-8", errors="replace"))
    ssh.close()
except Exception as e:
    print(e)
