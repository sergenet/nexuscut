import os
import zipfile
import urllib.request
from fpdf import FPDF

os.makedirs('temp_assets', exist_ok=True)

class BlueprintPDF(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 15)
        self.set_text_color(255, 0, 0)
        self.cell(0, 10, 'NEXUSCUT CREATOR MASTERCLASS', 0, 1, 'C')
        self.ln(5)

# 1. HORMOZI BLUEPRINT
h_pdf = BlueprintPDF()
h_pdf.add_page()
h_pdf.set_font("Arial", size=11)
h_content = """THE HORMOZI STYLE BLUEPRINT

1. Typography & Colors
- Primary Font: TheBoldFont or Montserrat Black (All Caps)
- Main Color: Bright Yellow (Hex #FFE800) and White (#FFFFFF)
- Text Stroke: 8px Solid Black (#000000)
- Shadow: Distance 4, Blur 10, Opacity 90% (Black)

2. Animation Timing
- Captions should appear exactly as the word is spoken (0.1s tolerance).
- Emphasize keywords by scaling them to 120% and coloring them Yellow.
- Max 3-5 words on screen at a time to maintain high visual pacing.

3. The "Pattern Interrupt"
- Every 3 seconds, the visual MUST change.
- Zoom in 110% on the speaker, cut to a B-roll image, or flash the screen white for 1 frame.
- Sound effect: Use a low-end "Whoosh" on every single camera zoom. Use a high-end "Pop" on keyword emphasis.

Follow these rules religiously to maximize retention.
"""
for line in h_content.split('\n'):
    h_pdf.cell(0, 8, txt=line, ln=1)
h_pdf.output("temp_assets/hormozi_blueprint.pdf")

# 2. ABDAAL BLUEPRINT
a_pdf = BlueprintPDF()
a_pdf.add_page()
a_pdf.set_font("Arial", size=11)
a_content = """THE ABDAAL PRODUCTIVITY STYLE BLUEPRINT

1. Typography & Aesthetics
- Primary Font: SF Pro Display or Inter (Semi-Bold)
- Style: Minimalist, clean. Mixed case (not all caps).
- Animation: Smooth fade-ins and subtle slide-ups. No aggressive pop-ins.
- Colors: Soft pastel highlights (Mint Green, Light Blue) over dark minimal backgrounds.

2. Pacing & B-Roll
- Keep a relaxed but highly informative pace.
- Use elegant, high-quality B-roll of desks, typing, writing, or iPad drawing.
- Instead of jarring jump cuts, use smooth cross-dissolves or J-cuts (audio starts before video).

3. Sound Design
- Ambient Lofi or Chillhop background music (Volume: -25db).
- Paper rustles, keyboard clicks, and subtle mechanical whooshes for transitions.
- The focus is on clarity and value, not overwhelming the viewer's senses.
"""
for line in a_content.split('\n'):
    a_pdf.cell(0, 8, txt=line, ln=1)
a_pdf.output("temp_assets/abdaal_blueprint.pdf")

print("Blueprints generated.")

# Download fonts from Google Fonts (Inter and Montserrat)
fonts_to_dl = {
    "Montserrat-Black.ttf": "https://github.com/google/fonts/raw/main/ofl/montserrat/Montserrat-Black.ttf",
    "Inter-SemiBold.ttf": "https://github.com/google/fonts/raw/main/ofl/inter/Inter%5Bslnt%2Cwght%5D.ttf"
}

for fname, url in fonts_to_dl.items():
    try:
        print(f"Downloading {fname}...")
        urllib.request.urlretrieve(url, f"temp_assets/{fname}")
    except Exception as e:
        print(f"Failed to download {fname}: {e}")

# Bundle Hormozi Kit
with zipfile.ZipFile("hormozi_template.zip", "w") as zf:
    zf.write("temp_assets/hormozi_blueprint.pdf", "Hormozi_Masterclass_Blueprint.pdf")
    if os.path.exists("temp_assets/Montserrat-Black.ttf"):
        zf.write("temp_assets/Montserrat-Black.ttf", "Fonts/Montserrat-Black.ttf")
    # Add dummy SFX placeholder to show folder structure
    zf.writestr("SoundEffects/whoosh.mp3", b"dummy mp3 data")
    zf.writestr("SoundEffects/pop.mp3", b"dummy mp3 data")

# Bundle Abdaal Kit
with zipfile.ZipFile("abdaal_template.zip", "w") as zf:
    zf.write("temp_assets/abdaal_blueprint.pdf", "Abdaal_Masterclass_Blueprint.pdf")
    if os.path.exists("temp_assets/Inter-SemiBold.ttf"):
        zf.write("temp_assets/Inter-SemiBold.ttf", "Fonts/Inter-SemiBold.ttf")
    zf.writestr("SoundEffects/paper_rustle.mp3", b"dummy mp3 data")
    zf.writestr("SoundEffects/keyboard_click.mp3", b"dummy mp3 data")

print("Zips generated successfully!")
