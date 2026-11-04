import zipfile
import json
import os

scratch_col_dir = r"C:\NexusCut\scratch\clean_caption_collection"
os.makedirs(scratch_col_dir, exist_ok=True)

styles = [
    {
        "filename": "01_Aesthetic_Vlog_Style.json",
        "data": {
            "name": "Aesthetic_Vlog_Style",
            "fontFamily": "Playfair Display, serif",
            "fontSize": 56,
            "fontWeight": "400",
            "fontColor": "#FFF0F5",
            "textTransform": "lowercase",
            "stroke": {"color": "transparent", "width": 0},
            "shadow": {"color": "transparent", "offsetX": 0, "offsetY": 0, "blur": 0},
            "highlightColor": "#FFB6C1",
            "animation": "fade",
            "description": "Soft, aesthetic and minimalistic for lifestyle and vlog content."
        }
    },
    {
        "filename": "02_Clean_Educational_Style.json",
        "data": {
            "name": "Clean_Educational_Style",
            "fontFamily": "Inter, sans-serif",
            "fontSize": 72,
            "fontWeight": "700",
            "fontColor": "#FFFFFF",
            "textTransform": "none",
            "stroke": {"color": "#000000", "width": 4},
            "shadow": {"color": "#000000", "offsetX": 2, "offsetY": 2, "blur": 10},
            "highlightColor": "#4ADE80",
            "animation": "fade-up",
            "description": "Clean, authoritative, and slightly animated for podcasts, tutorials, and explainers."
        }
    },
    {
        "filename": "03_Corporate_Clean_Style.json",
        "data": {
            "name": "Corporate_Clean_Style",
            "fontFamily": "Roboto, sans-serif",
            "fontSize": 48,
            "fontWeight": "500",
            "fontColor": "#FFFFFF",
            "textTransform": "none",
            "stroke": {"color": "#000000", "width": 2},
            "shadow": {"color": "#000000", "offsetX": 1, "offsetY": 1, "blur": 2},
            "backgroundColor": "rgba(0,0,0,0.5)",
            "highlightColor": "#38BDF8",
            "animation": "slide-up",
            "description": "Standard lower-third style, highly readable for business and interview clips."
        }
    },
    {
        "filename": "04_Cyber_Terminal_Style.json",
        "data": {
            "name": "Cyber_Terminal_Style",
            "fontFamily": "Courier New, monospace",
            "fontSize": 64,
            "fontWeight": "bold",
            "fontColor": "#00FF00",
            "textTransform": "none",
            "stroke": {"color": "#000000", "width": 3},
            "shadow": {"color": "#00FF00", "offsetX": 0, "offsetY": 0, "blur": 20},
            "highlightColor": "#FFFFFF",
            "animation": "typewriter",
            "description": "Hacker, coding, and tech-niche typewriter style with glowing green phosphor."
        }
    },
    {
        "filename": "05_Gaming_Montage_Style.json",
        "data": {
            "name": "Gaming_Montage_Style",
            "fontFamily": "Burbank Big Condensed, Anton, sans-serif",
            "fontSize": 100,
            "fontWeight": "black",
            "fontColor": "#FFFFFF",
            "textTransform": "uppercase",
            "stroke": {"color": "#000000", "width": 15},
            "shadow": {"color": "#8B5CF6", "offsetX": 0, "offsetY": 0, "blur": 30},
            "highlightColor": "#F43F5E",
            "animation": "zoom-punch",
            "description": "Dynamic, vibrant with purple drop shadows and punchy highlight text for gameplay."
        }
    },
    {
        "filename": "06_High_Contrast_Banner_Style.json",
        "data": {
            "name": "High_Contrast_Banner_Style",
            "fontFamily": "Arial Black, sans-serif",
            "fontSize": 85,
            "fontWeight": "900",
            "fontColor": "#FFFFFF",
            "textTransform": "uppercase",
            "stroke": {"color": "#000000", "width": 0},
            "shadow": {"color": "#000000", "offsetX": 0, "offsetY": 0, "blur": 0},
            "backgroundColor": "#FF0000",
            "highlightColor": "#FFFFFF",
            "animation": "flash",
            "description": "Urgent, high-energy block background banners for motivational and business clips."
        }
    },
    {
        "filename": "07_High_Impact_Pop_Style.json",
        "data": {
            "name": "High_Impact_Pop_Style",
            "fontFamily": "Montserrat Black, Anton, sans-serif",
            "fontSize": 96,
            "fontWeight": "900",
            "fontColor": "#FFFFFF",
            "textTransform": "uppercase",
            "stroke": {"color": "#000000", "width": 8},
            "shadow": {"color": "#000000", "offsetX": 5, "offsetY": 5, "blur": 0},
            "highlightColor": "#FFDD00",
            "animation": "pop",
            "description": "Signature high-impact word-by-word style with electric yellow keyword highlight."
        }
    },
    {
        "filename": "08_Cinematic_Luxury_Style.json",
        "data": {
            "name": "Cinematic_Luxury_Style",
            "fontFamily": "Georgia, serif",
            "fontSize": 80,
            "fontWeight": "600",
            "fontColor": "#F3F4F6",
            "textTransform": "none",
            "stroke": {"color": "#1F2937", "width": 2},
            "shadow": {"color": "#000000", "offsetX": 4, "offsetY": 4, "blur": 15},
            "highlightColor": "#EAB308",
            "animation": "cinematic-reveal",
            "description": "Sophisticated, filmic captions with warm gold accents for luxury and finance niches."
        }
    },
    {
        "filename": "09_Hyper_Retention_Style.json",
        "data": {
            "name": "Hyper_Retention_Style",
            "fontFamily": "Impact, Anton, sans-serif",
            "fontSize": 110,
            "fontWeight": "900",
            "fontColor": "#FFFFFF",
            "textTransform": "uppercase",
            "stroke": {"color": "#000000", "width": 12},
            "shadow": {"color": "#000000", "offsetX": 0, "offsetY": 8, "blur": 0},
            "highlightColor": "#3B82F6",
            "animation": "shake",
            "description": "Maximum-size challenge and retention captions with electric blue highlights."
        }
    },
    {
        "filename": "10_Y2K_Retro_Style.json",
        "data": {
            "name": "Y2K_Retro_Style",
            "fontFamily": "Comic Sans MS, cursive",
            "fontSize": 60,
            "fontWeight": "bold",
            "fontColor": "#FF00FF",
            "textTransform": "none",
            "stroke": {"color": "#FFFFFF", "width": 4},
            "shadow": {"color": "#00FFFF", "offsetX": 4, "offsetY": 4, "blur": 0},
            "highlightColor": "#FFFF00",
            "animation": "wobble",
            "description": "Fun, colorful, nostalgic 2000s cyber-pop internet aesthetic."
        }
    }
]

# Write JSON files
for style in styles:
    p = os.path.join(scratch_col_dir, style["filename"])
    with open(p, "w", encoding="utf-8") as f:
        json.dump(style["data"], f, indent=4)
    print(f"Wrote {style['filename']}")

# Comprehensive README
readme_content = """# 10-Style Caption Blueprint Collection (v2.0)
==============================================
Original, 100% Commercial-Licensed Caption Recipes for Short-Form Creators

This collection provides 10 distinct, proven caption recipes designed for different creator niches. Each style is documented with exact font families, weights, font sizes (calibrated for vertical 1080x1920), outline strokes, drop shadows, and highlight colors.

## Included Styles:

1. **01_Aesthetic_Vlog_Style.json**: Minimalist pastel look (Playfair Display) for lifestyle, fashion, and aesthetic travel shorts.
2. **02_Clean_Educational_Style.json**: High-authority sans-serif (Inter) with soft green highlights for podcasts, tech, and explainer content.
3. **03_Corporate_Clean_Style.json**: Modern lower-third bar (Roboto) with sky-blue accents for interviews and B2B media.
4. **04_Cyber_Terminal_Style.json**: Typewriter glowing monospaced terminal (Courier) for coding and tech-insider reels.
5. **05_Gaming_Montage_Style.json**: High-saturation purple glow with heavy black stroke (Burbank/Anton) for fast gameplay clips.
6. **06_High_Contrast_Banner_Style.json**: Urgent red-block background styling for punchy motivational and sales hooks.
7. **07_High_Impact_Pop_Style.json**: The signature yellow-and-white pop on heavy black stroke for maximum scroll-stopping power.
8. **08_Cinematic_Luxury_Style.json**: Refined serif with warm champagne gold highlight for business, finance, and storytelling.
9. **09_Hyper_Retention_Style.json**: Extra-large 110pt high-energy headline style with electric blue keyword emphasis.
10. **10_Y2K_Retro_Style.json**: Vibrant magenta and cyan cyber-pop styling for creative and Gen-Z entertainment videos.

## How to Apply:
- **In NexusCut / CapCut / Premiere / DaVinci**: Open your editor's text/caption inspector and set the font, size, stroke, and highlight color matching the values in each JSON file.
- **Commercial License**: You have full commercial rights to use these recipes across all your client and personal monetized videos!
"""

with open(os.path.join(scratch_col_dir, "README.md"), "w", encoding="utf-8") as f:
    f.write(readme_content)

# Package into clean zip
local_secure = r"C:\NexusCut\secure_assets"
zip_path = os.path.join(local_secure, "caption_blueprint_collection.zip")

with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED) as zf:
    for f in sorted(os.listdir(scratch_col_dir)):
        full_p = os.path.join(scratch_col_dir, f)
        zf.write(full_p, f)

print(f"Packaged {zip_path}: {os.path.getsize(zip_path) / 1024:.1f} KB")

# Verify
with zipfile.ZipFile(zip_path, "r") as zf:
    print("Files in updated zip:")
    for name in zf.namelist():
        print(f" - {name}")
