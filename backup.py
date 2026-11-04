import os
import zipfile
from datetime import datetime

def backup():
    timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M-%S')
    zip_name = f'nexuscut_live_backup_{timestamp}.zip'
    
    ignore_dirs = {'.git', '.next', 'node_modules', '.idea', 'screenshots', 'UI-Mockups', 'mobile_backup'}
    ignore_exts = {'.zip', '.db'}
    
    print(f'Creating {zip_name} ...')
    
    with zipfile.ZipFile(zip_name, 'w', zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk('.'):
            # Mutate dirs to skip ignored directories
            dirs[:] = [d for d in dirs if d not in ignore_dirs and not d.startswith('nexuscut_live_backup')]
            
            for file in files:
                if any(file.endswith(ext) for ext in ignore_exts):
                    continue
                if file.startswith('nexuscut_live_backup'):
                    continue
                
                file_path = os.path.join(root, file)
                # Ensure we don't zip our own output
                if file_path == f'./{zip_name}':
                    continue
                
                arcname = os.path.relpath(file_path, '.')
                zf.write(file_path, arcname)
                
    print(f'Backup created successfully: {zip_name}')
    
if __name__ == '__main__':
    backup()
