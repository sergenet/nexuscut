import zipfile
import os

gameplay_dir = r"C:\NexusCut\scratch\gameplay_clips"
satisfying_dir = r"C:\NexusCut\scratch\satisfying_clips"
out_dir = r"C:\NexusCut\scratch\final_packages"
os.makedirs(out_dir, exist_ok=True)

readme_content = """NexusCut Creator Asset Pack
===========================
Resolution: 1080x1920 (9:16 Vertical)
Framerate: 60 FPS
Encoding: High-Bitrate H.264
Loop Type: 100% Seamless Infinite Loop

How to use in NexusCut:
1. Import into Media Library.
2. Drag onto Track 1 (bottom half) or as full background.
3. Duplicate or extend along the timeline for infinite smooth looping with zero stutter.
4. Enjoy 100% commercial project license for YouTube Shorts, TikTok, and Instagram Reels!
"""

# 1. Satisfying Loops Pack (asmr_backgrounds.zip)
asmr_zip = os.path.join(out_dir, "asmr_backgrounds.zip")
with zipfile.ZipFile(asmr_zip, 'w', compression=zipfile.ZIP_DEFLATED) as zf:
    zf.writestr("README.txt", readme_content)
    for f in sorted(os.listdir(satisfying_dir)):
        if f.endswith('.mp4'):
            zf.write(os.path.join(satisfying_dir, f), f)
print(f"Created {asmr_zip}: {os.path.getsize(asmr_zip) / 1024 / 1024:.2f} MB")

# 2. Gameplay Loops Pack (gta_backgrounds.zip)
gta_zip = os.path.join(out_dir, "gta_backgrounds.zip")
with zipfile.ZipFile(gta_zip, 'w', compression=zipfile.ZIP_DEFLATED) as zf:
    zf.writestr("README.txt", readme_content)
    for f in sorted(os.listdir(gameplay_dir)):
        if f.endswith('.mp4'):
            zf.write(os.path.join(gameplay_dir, f), f)
print(f"Created {gta_zip}: {os.path.getsize(gta_zip) / 1024 / 1024:.2f} MB")

# 3. All-Access Background Bundle (all_access_background_bundle.zip)
bundle_zip = os.path.join(out_dir, "all_access_background_bundle.zip")
with zipfile.ZipFile(bundle_zip, 'w', compression=zipfile.ZIP_DEFLATED) as zf:
    zf.writestr("README.txt", readme_content)
    for f in sorted(os.listdir(satisfying_dir)):
        if f.endswith('.mp4'):
            zf.write(os.path.join(satisfying_dir, f), os.path.join("Satisfying Loops", f))
    for f in sorted(os.listdir(gameplay_dir)):
        if f.endswith('.mp4'):
            zf.write(os.path.join(gameplay_dir, f), os.path.join("Gameplay Loops", f))
print(f"Created {bundle_zip}: {os.path.getsize(bundle_zip) / 1024 / 1024:.2f} MB")
