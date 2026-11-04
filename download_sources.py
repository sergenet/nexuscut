import urllib.request
import os

os.makedirs('temp_assets', exist_ok=True)

gta_url = "https://archive.org/download/GrandTheftAutoSA_746/GrandTheftAutoSA_746_LQ_part04_512kb.mp4"
asmr_url = "https://archive.org/download/17MostRelaxingSlimeVideos02SatisfyingASMR/17-Most%20Relaxing%20Slime%20Videos%20%2302%20%28Satisfying%20ASMR%29.mp4"

print("Downloading GTA source...")
try:
    urllib.request.urlretrieve(gta_url, "temp_assets/gta_source.mp4")
    print("GTA source downloaded.")
except Exception as e:
    print("Error GTA:", e)

print("Downloading ASMR source...")
try:
    urllib.request.urlretrieve(asmr_url, "temp_assets/asmr_source.mp4")
    print("ASMR source downloaded.")
except Exception as e:
    print("Error ASMR:", e)
