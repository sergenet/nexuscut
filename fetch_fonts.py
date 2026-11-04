import urllib.request
import os

fonts_dir = r"C:\NexusCut\scratch\hormozi_suite\Fonts"

fonts = [
    ("Montserrat-VariableFont_wght.ttf", "https://raw.githubusercontent.com/google/fonts/main/ofl/montserrat/Montserrat%5Bwght%5D.ttf"),
    ("Oswald-VariableFont_wght.ttf", "https://raw.githubusercontent.com/google/fonts/main/ofl/oswald/Oswald%5Bwght%5D.ttf"),
    ("Anton-Regular.ttf", "https://raw.githubusercontent.com/google/fonts/main/ofl/anton/Anton-Regular.ttf"),
    ("Bangers-Regular.ttf", "https://raw.githubusercontent.com/google/fonts/main/ofl/bangers/Bangers-Regular.ttf"),
]

for filename, url in fonts:
    dest = os.path.join(fonts_dir, filename)
    print(f"Downloading {filename}...")
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as resp, open(dest, 'wb') as f:
            f.write(resp.read())
        print(f"Saved {filename} ({os.path.getsize(dest) / 1024:.1f} KB)")
    except Exception as e:
        print(f"Failed {filename}: {e}")

print("Font downloads complete!")
