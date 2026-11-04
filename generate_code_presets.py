import json
import os

code_dir = r"C:\NexusCut\scratch\hormozi_suite\Presets_and_Code"
os.makedirs(code_dir, exist_ok=True)

# 1. Enhanced JSON Blueprint
blueprint = {
    "pack_name": "NexusCut High-Impact Caption Creator Suite",
    "version": "2.0.0",
    "license": "Commercial Creator & Client License",
    "style_profile": {
        "primary_look": "Bold Short-Form High-Retention",
        "typography": {
            "primary_font": "Montserrat-Black",
            "fallback_fonts": ["Anton", "Oswald Bold", "Impact", "Arial Black"],
            "font_size_vertical_1080p": 96,
            "font_weight": 900,
            "text_transform": "uppercase",
            "letter_spacing_px": 2,
            "line_height": 1.15
        },
        "color_palette": {
            "base_text": "#FFFFFF",
            "primary_highlight": "#FFDD00",
            "secondary_highlight": "#39FF14",
            "warning_highlight": "#FF3B30",
            "accent_glow": "#FFD700"
        },
        "border_stroke": {
            "color": "#000000",
            "width_px": 8,
            "line_join": "round"
        },
        "drop_shadow": {
            "color": "rgba(0, 0, 0, 0.95)",
            "offset_x_px": 5,
            "offset_y_px": 6,
            "blur_radius_px": 0
        },
        "animation": {
            "type": "scale_pop_and_settle",
            "duration_ms": 140,
            "keyframes": [
                {"time": "0%", "scale": 0.85, "opacity": 0.2},
                {"time": "65%", "scale": 1.12, "opacity": 1.0},
                {"time": "100%", "scale": 1.0, "opacity": 1.0}
            ]
        },
        "layout_rules": {
            "alignment": "center",
            "vertical_position_percentage": 68,
            "max_words_per_line": 3,
            "ideal_word_duration_ms": 280
        }
    }
}

with open(os.path.join(code_dir, "High_Impact_Blueprint.json"), "w", encoding="utf-8") as f:
    json.dump(blueprint, f, indent=4)

# 2. Advanced SubStation Alpha (.ass) Template
ass_content = """[Script Info]
Title: NexusCut High-Impact Caption Template
ScriptType: v4.00+
WrapStyle: 0
ScaledBorderAndShadow: yes
YCbCr Matrix: TV.709
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: HighImpact,Montserrat Black,96,&H00FFFFFF,&H0000DDF&,&H00000000,&H00000000,-1,0,0,0,100,100,2,0,1,8,5,5,40,40,650,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
; Example word-by-word dialogue with yellow highlight tag {\\c&H00DDF&}:
Dialogue: 0,0:00:00.00,0:00:00.32,HighImpact,,0,0,0,,{\\t(0,120,\\fscx112\\fscy112)\\t(120,200,\\fscx100\\fscy100)}STOP {\\c&H00DDF&}DOING{\\c&HFFFFFF&} THIS
Dialogue: 0,0:00:00.32,0:00:00.75,HighImpact,,0,0,0,,{\\t(0,120,\\fscx112\\fscy112)\\t(120,200,\\fscx100\\fscy100)}IF YOU WANT {\\c&H00DDF&}RESULTS{\\c&HFFFFFF&}
"""
with open(os.path.join(code_dir, "High_Impact_Subtitles.ass"), "w", encoding="utf-8") as f:
    f.write(ass_content)

# 3. CSS Animation and Styling File
css_content = """/* NexusCut High-Impact Short-Form Caption Stylesheet */

.high-impact-caption {
    font-family: 'Montserrat', 'Anton', sans-serif;
    font-weight: 900;
    font-size: 5.5rem;
    line-height: 1.1;
    text-transform: uppercase;
    text-align: center;
    color: #FFFFFF;
    -webkit-text-stroke: 8px #000000;
    paint-order: stroke fill;
    text-shadow: 5px 6px 0px #000000;
    letter-spacing: 2px;
    display: inline-block;
    animation: captionPop 140ms cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

/* Yellow Highlighted Keyword */
.high-impact-caption .highlight-yellow {
    color: #FFDD00;
    -webkit-text-stroke: 8px #000000;
}

/* Green Highlighted Keyword */
.high-impact-caption .highlight-green {
    color: #39FF14;
    -webkit-text-stroke: 8px #000000;
}

/* Signature Scale Pop Keyframe */
@keyframes captionPop {
    0% {
        transform: scale(0.85);
        opacity: 0.3;
    }
    70% {
        transform: scale(1.12);
        opacity: 1.0;
    }
    100% {
        transform: scale(1.0);
        opacity: 1.0;
    }
}
"""
with open(os.path.join(code_dir, "High_Impact_Styles.css"), "w", encoding="utf-8") as f:
    f.write(css_content)

# 4. FFmpeg Burn Guide
ffmpeg_guide = """# Burn High-Impact Captions with FFmpeg
# =======================================
# Run this command in terminal to permanently burn your High_Impact_Subtitles.ass file
# onto any vertical MP4 video with hardware acceleration and crisp font rendering:

ffmpeg -i input_video.mp4 -vf "ass=High_Impact_Subtitles.ass:fontsdir=../Fonts" -c:v libx264 -preset slow -crf 18 -c:a copy output_video_with_captions.mp4
"""
with open(os.path.join(code_dir, "FFmpeg_Burn_Command.txt"), "w", encoding="utf-8") as f:
    f.write(ffmpeg_guide)

print("Presets and code generated!")
