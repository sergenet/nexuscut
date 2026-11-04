import paramiko

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    cmd = """
pip3 uninstall -y rembg scipy numba numpy pymatting
pip3 install "numpy<2" "scipy<1.13" "pymatting" "rembg[cpu]" --break-system-packages
python3 -c "import rembg; print('REMBG SUCCESSFULLY LOADED')"
"""
    stdin, stdout, stderr = ssh.exec_command(cmd)
    print("STDOUT:", stdout.read().decode("utf-8", errors="replace"))
    print("STDERR:", stderr.read().decode("utf-8", errors="replace"))
    
    ssh.close()
except Exception as e:
    print(e)
