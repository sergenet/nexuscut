import os

guides_dir = r"C:\NexusCut\scratch\hormozi_suite\Guides"
os.makedirs(guides_dir, exist_ok=True)

# 1. Multi-Editor Settings Guide
editor_guide = """# Multi-Editor Preset Settings Cheatsheet
## NexusCut High-Impact Caption Creator Suite

This cheatsheet provides the exact slider values, font settings, and animation keyframes to replicate the High-Impact caption aesthetic across all major video editors.

---

### 1. NexusCut
* **Font**: `Montserrat` (or `Anton`)
* **Weight**: `Black (900)`
* **Text Case**: `UPPERCASE`
* **Font Size**: `96 px` (for 1080x1920 vertical format)
* **Base Color**: `#FFFFFF` (Pure White)
* **Highlight Color**: `#FFDD00` (Electric Yellow) or `#39FF14` (Neon Green)
* **Stroke / Outline**: `#000000`, Width: `8 px`
* **Drop Shadow**: Color: `#000000`, Offset X: `5 px`, Offset Y: `6 px`, Blur: `0 px` (Hard edge)
* **Animation**: `Pop & Settle` (140 ms)

---

### 2. CapCut (Desktop & Mobile)
1. In the **Text** panel, select your auto-generated or manual caption track.
2. **Font**: Select **Montserrat** (or click *Add Font* and import `Montserrat-VariableFont_wght.ttf` from the `Fonts/` folder).
3. **Style Settings**:
   * **Size**: `12 - 14`
   * **Case**: `AA` (All Caps)
   * **Color**: `#FFFFFF`
4. **Stroke**:
   * Check **Stroke** box
   * Color: `#000000`
   * Thickness Slider: `32% - 36%`
5. **Shadow**:
   * Check **Shadow** box
   * Color: `#000000`
   * Opacity: `100%`
   * Blur: `0%` (Crucial for the crisp comic-book look)
   * Distance: `15%`
   * Angle: `45°`
6. **Animation**:
   * Go to **Animation** -> **In** -> Select **Spring** or **Zoom In 1**
   * Set animation duration slider to `0.1s` (ultra-snappy)
7. **Keyword Highlights**:
   * Double-click individual punch words (e.g. *MONEY*, *SECRET*, *FAIL*) and change the text fill color to `#FFDD00`.

---

### 3. Adobe Premiere Pro (Essential Graphics)
1. Open the **Essential Graphics** or **Text** workspace.
2. Select your Caption / Graphic layer.
3. **Text Properties**:
   * **Font**: `Montserrat`
   * **Font Style**: `Black`
   * **Size**: `105 pt`
   * **Tracking**: `20`
   * **All Caps Button**: Enabled [TT]
4. **Appearance**:
   * **Fill**: `#FFFFFF`
   * **Stroke**: Check box -> Color `#000000`, Width: `18` (Set to *Outer Stroke*)
   * **Shadow**: Check box -> Color `#000000`, Opacity: `100%`, Angle: `135°`, Distance: `12`, Size: `0` (Zero blur)
5. **Scale Pop Preset**:
   * At caption start: Scale `85%`
   * At +4 frames (at 60fps): Scale `112%`
   * At +8 frames: Scale `100%`

---

### 4. DaVinci Resolve (Fusion / Text+)
1. In the Edit page, add a **Text+** title.
2. In the Inspector (**Text** tab):
   * **Font**: `Montserrat`
   * **Typeface**: `Black`
   * **Size**: `0.075`
3. In the **Shading** tab:
   * **Element 1 (Text Fill)**: Color `#FFFFFF`
   * **Element 2 (Text Outline)**: Enabled -> Color `#000000`, Thickness `0.08`, Join Style: `Round`
   * **Element 3 (Drop Shadow)**: Enabled -> Color `#000000`, Offset X: `0.015`, Offset Y: `-0.018`, Blur: `0.0`
4. Highlight words: Switch Shading Element 1 color to `#FFDD00` for key words.

---

### 5. Final Cut Pro
1. Add a **Custom** or **Basic Title**.
2. **Font**: `Montserrat`, Weight: `Black`, Size: `115 pt`, All Caps: `Checked`.
3. **Outline**: Color: Black, Width: `14%`.
4. **Drop Shadow**: Color: Black, Opacity: `100%`, Blur: `0%`, Distance: `10 pt`, Angle: `315°`.
"""
with open(os.path.join(guides_dir, "Multi_Editor_Settings_Guide.md"), "w", encoding="utf-8") as f:
    f.write(editor_guide)

# 2. The High-Impact Caption Playbook
playbook = """# The High-Impact Caption Playbook
## Strategy, Pacing & Retention Guide for Short-Form Video

High-impact captions are not just text on a screen—they are a visual pacing engine designed to hold viewer attention through the critical first 3 seconds and eliminate scroll-away triggers.

---

### 1. The Pacing Formula: 1 to 3 Words Per Screen
* **The Fatal Mistake**: Displaying full sentences of 6–10 words at once. When viewers see a full sentence, their brain reads it in 1.5 seconds and immediately scrolls because they already know what you are going to say.
* **The High-Impact Rule**: Display only **1 to 3 words at a time**.
* **Average Duration**: Keep each word on screen for **220ms – 320ms**.
* **Result**: The viewer's eyes are locked to the center of the frame, waiting for the next word to appear.

---

### 2. The Color Psychology: Why Yellow (#FFDD00) Wins
* Human vision detects yellow faster than any other color in the visible spectrum.
* When placed on a dark or video background with a thick black stroke:
  * White text (#FFFFFF) provides the neutral baseline.
  * Electric Yellow (#FFDD00) acts as an automatic visual trigger.
* **Rule**: Highlight only **1 keyword per phrase** (the action verb, the key statistic, or the emotional trigger). 
  * Example: *"I LOST 50 POUNDS"* -> Highlight **50 POUNDS** in Yellow, leave *"I LOST"* in White.

---

### 3. Safe Zones for Mobile Platforms
Mobile apps (TikTok, Reels, YouTube Shorts) place interface elements over your video:
* **Bottom 25%**: Covered by username, description, sound title, and like/comment buttons.
* **Top 15%**: Covered by the search bar, 'Following/For You' tabs, and camera buttons.
* **Right 15%**: Covered by the vertical like, comment, bookmark, and share column.
* **The Sweet Spot**: Place your captions between **55% and 70%** from the top of the 1080x1920 screen (just above the platform description box).

---

### 4. Audio-Visual Synchronization (SFX Pairing)
A caption without audio accentuates the visual, but syncing a tactile sound effect turns it into a dopamine hit:
* **Word Pop**: Use `01_clean_pop.wav` or `02_bubble_pop.wav` on key transitions.
* **Fact / Stat Drop**: Use `04_bell_ding.wav` when revealing a dollar amount or number.
* **Hard Cut / Pattern Interrupt**: Use `05_impact_boom.wav` or `06_sub_bass_drop.wav` on the hook (0–1s).
* **Topic Transition**: Use `03_fast_swoosh.wav` or `08_whip_swoosh.wav`.

---

### 5. Commercial Project License
All fonts (SIL OFL 1.1), sound effects, graphic badges, and preset templates included in this suite are 100% royalty-free for commercial use across client deliverables, social channels, and monetized videos.
"""
with open(os.path.join(guides_dir, "The_High_Impact_Caption_Playbook.md"), "w", encoding="utf-8") as f:
    f.write(playbook)

# 3. Master README
readme = """# NexusCut High-Impact Caption Creator Suite (v2.0)
===================================================

Thank you for purchasing the High-Impact Caption Creator Suite! This package includes everything you need to create bold, high-retention short-form captions across any video editor.

## What's Included:

1. 📁 **Fonts/**:
   - `Montserrat-VariableFont_wght.ttf` (Full range: Thin to ExtraBold to Black)
   - `Anton-Regular.ttf` (The ultra-heavy headline font)
   - `Oswald-VariableFont_wght.ttf` (Condensed modern headline font)
   - `Bangers-Regular.ttf` (Punchy comic viral font)
   - `OFL_LICENSE.txt` (100% Free Commercial Open Font License)

2. 📁 **Sound_Effects/** (Both WAV & MP3 formats included):
   - `01_clean_pop` (Signature word pop)
   - `02_bubble_pop` (High-retention chirp pop)
   - `03_fast_swoosh` (Rapid caption transition)
   - `04_bell_ding` (Stat/cash revelation accent)
   - `05_impact_boom` (Hook & pattern interrupt drop)
   - `06_sub_bass_drop` (Deep cinematic sub hit)
   - `07_mechanical_click` (Tactile button snap)
   - `08_whip_swoosh` (High-energy dynamic sweep)

3. 📁 **Graphic_Overlays/** (High-Resolution Transparent 32-bit PNGs):
   - `01_badge_stop_scrolling.png`
   - `02_badge_pro_tip.png`
   - `03_badge_warning.png`
   - `04_badge_secret_revealed.png`
   - `05_badge_100_percent.png`
   - `06_badge_key_takeaway.png`
   - `07_arrow_down_bold.png`
   - `08_highlighter_underline.png`

4. 📁 **Presets_and_Code/**:
   - `High_Impact_Blueprint.json` (Structured JSON definition)
   - `High_Impact_Subtitles.ass` (Universal subtitle preset with tags)
   - `High_Impact_Styles.css` (Web styling with @keyframes captionPop)
   - `FFmpeg_Burn_Command.txt` (One-line command to burn captions with FFmpeg)

5. 📁 **Guides/**:
   - `Multi_Editor_Settings_Guide.md` (Exact slider settings for NexusCut, CapCut, Premiere, DaVinci & Final Cut)
   - `The_High_Impact_Caption_Playbook.md` (Strategic retention pacing, word limits & safe zones)
"""
with open(r"C:\NexusCut\scratch\hormozi_suite\README.md", "w", encoding="utf-8") as f:
    f.write(readme)

print("Guides and master README generated!")
