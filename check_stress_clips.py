import os
import subprocess
import json

folder = r"C:\NexusCut\MP4 Stress Test Pack\Short Clips (10–30 seconds)"
for f in os.listdir(folder):
    if f.endswith('.mp4'):
        p = os.path.join(folder, f)
        print(f"{f}: {os.path.getsize(p) / 1024 / 1024:.2f} MB")
