import zipfile
import os

zip_path = r"C:\NexusCut\secure_assets\hook_script_toolkit.zip"
with zipfile.ZipFile(zip_path, 'r') as zf:
    hooks = zf.read('10_Viral_Hooks.md').decode('utf-8')
    scripts = zf.read('Script_Templates.md').decode('utf-8')
    readme = zf.read('README.md').decode('utf-8')

# Replace celebrity name with generic high-converting strategy example
hooks_clean = hooks.replace("Alex Hormozi", "viral 3-hook")

scratch_dir = r"C:\NexusCut\scratch\clean_hook_toolkit"
os.makedirs(scratch_dir, exist_ok=True)

with open(os.path.join(scratch_dir, '10_Viral_Hooks.md'), 'w', encoding='utf-8') as f:
    f.write(hooks_clean)
with open(os.path.join(scratch_dir, 'Script_Templates.md'), 'w', encoding='utf-8') as f:
    f.write(scripts)
with open(os.path.join(scratch_dir, 'README.md'), 'w', encoding='utf-8') as f:
    f.write(readme)

with zipfile.ZipFile(zip_path, 'w', compression=zipfile.ZIP_DEFLATED) as zf:
    for f in sorted(os.listdir(scratch_dir)):
        zf.write(os.path.join(scratch_dir, f), f)

print("Cleaned hook_script_toolkit.zip successfully!")
