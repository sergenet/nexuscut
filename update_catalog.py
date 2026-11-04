with open(r'C:\NexusCut\src\lib\marketplaceData.ts', 'r', encoding='utf-8') as f:
    c = f.read()

old_desc = "description: 'An editable JSON blueprint with the exact font, color, stroke, shadow, highlight, and pop-animation settings for a bold short-form caption look.',"
new_desc = "description: 'Complete Creator Suite with commercial fonts, SFX pop audio pack, transparent callout overlays, multi-editor cheatsheets (CapCut, Premiere, DaVinci, NexusCut), and retention guides for high-converting bold captions.',"

old_feats = "features: ['Editable JSON Blueprint', 'Yellow & White Highlights', 'Pop Animation Settings', 'Commercial Project License']"
new_feats = "features: ['4 Commercial Fonts Included', '8 SFX Pop & Impact Audio Clips', '8 Transparent Callout Badges', 'Multi-Editor Preset Cheatsheets', 'High-Impact Caption Playbook', 'Commercial Project License']"

c = c.replace(old_desc, new_desc).replace(old_feats, new_feats)
with open(r'C:\NexusCut\src\lib\marketplaceData.ts', 'w', encoding='utf-8') as f:
    f.write(c)
print('Updated marketplaceData.ts successfully!')
