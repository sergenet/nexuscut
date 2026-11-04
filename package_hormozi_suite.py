import zipfile
import os

suite_dir = r"C:\NexusCut\scratch\hormozi_suite"
local_secure = r"C:\NexusCut\secure_assets"
zip_path = os.path.join(local_secure, "hormozi_template.zip")

print("Packaging High-Impact Caption Creator Suite...")
with zipfile.ZipFile(zip_path, 'w', compression=zipfile.ZIP_DEFLATED) as zf:
    for root, dirs, files in os.walk(suite_dir):
        for f in files:
            full_p = os.path.join(root, f)
            rel_p = os.path.relpath(full_p, suite_dir)
            zf.write(full_p, rel_p)

print(f"Created {zip_path}: {os.path.getsize(zip_path) / 1024 / 1024:.2f} MB")

# Verify contents
with zipfile.ZipFile(zip_path, 'r') as zf:
    print(f"Total files in archive: {len(zf.namelist())}")
    for item in zf.namelist():
        print(f" - {item}")
