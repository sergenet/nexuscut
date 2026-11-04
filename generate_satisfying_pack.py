import cv2
import numpy as np
import subprocess
import os

width, height = 1080, 1920
fps = 60
duration_sec = 10
total_frames = fps * duration_sec
ffmpeg_bin = r"C:\NexusCut\node_modules\ffmpeg-static\ffmpeg.exe"

out_dir = r"C:\NexusCut\scratch\satisfying_clips"
os.makedirs(out_dir, exist_ok=True)

def encode_mp4(temp_raw, final_out):
    cmd = f'"{ffmpeg_bin}" -y -i "{temp_raw}" -c:v libx264 -preset fast -b:v 8000k -pix_fmt yuv420p "{final_out}"'
    subprocess.run(cmd, shell=True, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    if os.path.exists(temp_raw):
        os.remove(temp_raw)
    print(f"Generated: {os.path.basename(final_out)} ({os.path.getsize(final_out) / 1024 / 1024:.2f} MB)")

# 01: Kinetic Sand Ripples
def gen_sand_ripples():
    final_out = os.path.join(out_dir, "01_kinetic_sand_ripple.mp4")
    temp_raw = final_out.replace(".mp4", "_raw.mp4")
    writer = cv2.VideoWriter(temp_raw, cv2.VideoWriter_fourcc(*'mp4v'), fps, (width, height))
    cx, cy = width // 2, height // 2

    # Precompute distance grid downsampled for speed then upsample
    scale_down = 4
    sw, sh = width // scale_down, height // scale_down
    y_g, x_g = np.ogrid[:sh, :sw]
    dist_map = np.sqrt((x_g * scale_down - cx)**2 + (y_g * scale_down - cy)**2)

    for f in range(total_frames):
        p = f / total_frames
        # Concentric waves expanding outward
        wave = np.sin((dist_map * 0.035) - (p * 2 * np.pi * 3))
        # Add secondary interference wave
        wave2 = np.cos(((x_g * scale_down - cx) * 0.02) + ((y_g * scale_down - cy) * 0.02) - (p * 2 * np.pi * 2))
        combined = (wave * 0.7 + wave2 * 0.3)
        
        # Warm golden sand palette (BGR)
        # Deep shadow amber (20, 60, 140) to glowing light gold (80, 200, 255)
        norm_w = ((combined + 1.0) / 2.0)[:, :, None]
        base_col = np.array([25, 70, 150])
        peak_col = np.array([90, 215, 255])
        frame_small = (base_col + norm_w * (peak_col - base_col)).astype(np.uint8)
        
        # Upscale with smooth interpolation
        img = cv2.resize(frame_small, (width, height), interpolation=cv2.INTER_LINEAR)
        writer.write(img)
    writer.release()
    encode_mp4(temp_raw, final_out)

# 02: Hypnotic Geometric Pendulum Snake Wave
def gen_pendulum_wave():
    final_out = os.path.join(out_dir, "02_hypnotic_geometric_pendulum.mp4")
    temp_raw = final_out.replace(".mp4", "_raw.mp4")
    writer = cv2.VideoWriter(temp_raw, cv2.VideoWriter_fourcc(*'mp4v'), fps, (width, height))
    cx = width // 2
    num_balls = 20
    top_y = 200
    bottom_y = 1720
    y_spacing = (bottom_y - top_y) // num_balls

    for f in range(total_frames):
        p = f / total_frames
        img = np.zeros((height, width, 3), dtype=np.uint8)
        img[:] = (16, 12, 22) # Deep midnight velvet

        # Center reference guide line
        cv2.line(img, (cx, top_y - 40), (cx, bottom_y + 40), (45, 35, 60), 2)

        for i in range(num_balls):
            by = top_y + i * y_spacing
            # Harmonic frequency ratio: ball i executes (12 + i) full oscillations
            cycles = 6 + i * 0.5
            angle = np.sin(p * 2 * np.pi * cycles)
            amplitude = 360 - i * 8
            bx = int(cx + amplitude * angle)

            # Color shifts across rainbow spectrum
            hue = int((i / num_balls) * 180)
            col_bgr = cv2.cvtColor(np.uint8([[[hue, 240, 255]]]), cv2.COLOR_HSV2BGR)[0][0]
            col = (int(col_bgr[0]), int(col_bgr[1]), int(col_bgr[2]))

            # String line
            cv2.line(img, (cx, by), (bx, by), (60, 50, 80), 2, cv2.LINE_AA)
            # Outer glow
            cv2.circle(img, (bx, by), 24, (int(col[0]*0.4), int(col[1]*0.4), int(col[2]*0.4)), -1)
            # Polished sphere
            cv2.circle(img, (bx, by), 16, col, -1)
            # Specular highlight
            cv2.circle(img, (bx - 5, by - 5), 5, (255, 255, 255), -1)

        writer.write(img)
    writer.release()
    encode_mp4(temp_raw, final_out)

# 03: Rainbow Fluid Swirl
def gen_fluid_swirl():
    final_out = os.path.join(out_dir, "03_rainbow_fluid_swirl.mp4")
    temp_raw = final_out.replace(".mp4", "_raw.mp4")
    writer = cv2.VideoWriter(temp_raw, cv2.VideoWriter_fourcc(*'mp4v'), fps, (width, height))
    cx, cy = width // 2, height // 2

    scale_down = 4
    sw, sh = width // scale_down, height // scale_down
    y_g, x_g = np.ogrid[:sh, :sw]
    r_map = np.sqrt((x_g * scale_down - cx)**2 + (y_g * scale_down - cy)**2)
    theta_map = np.arctan2(y_g * scale_down - cy, x_g * scale_down - cx)

    for f in range(total_frames):
        p = f / total_frames
        # Logarithmic spiral vortex
        arms = 5
        spiral = (theta_map * arms + np.log(np.maximum(1, r_map)) * 6.0 - p * 2 * np.pi * 4)
        v = (np.sin(spiral) + 1.0) / 2.0
        
        # Color based on angle + time
        hue = ((theta_map / (2 * np.pi) + p * 2) % 1.0) * 180
        sat = np.clip(v * 255, 120, 255)
        val = np.clip(v * 255, 60, 255)

        hsv = np.stack([hue, sat, val], axis=-1).astype(np.uint8)
        bgr_small = cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)
        img = cv2.resize(bgr_small, (width, height), interpolation=cv2.INTER_LINEAR)
        writer.write(img)
    writer.release()
    encode_mp4(temp_raw, final_out)

# 04: Satisfying Isometric Cube Cascade
def gen_cube_cascade():
    final_out = os.path.join(out_dir, "04_satisfying_cube_cascade.mp4")
    temp_raw = final_out.replace(".mp4", "_raw.mp4")
    writer = cv2.VideoWriter(temp_raw, cv2.VideoWriter_fourcc(*'mp4v'), fps, (width, height))
    cx, cy = width // 2, height // 2

    cols, rows = 14, 22
    spacing_x, spacing_y = 65, 65

    for f in range(total_frames):
        p = f / total_frames
        img = np.zeros((height, width, 3), dtype=np.uint8)
        img[:] = (24, 18, 30)

        for r in range(rows):
            for c in range(cols):
                bx = int(cx + (c - cols/2 + 0.5) * spacing_x)
                by = int(cy + (r - rows/2 + 0.5) * spacing_y)
                
                # Diagonal ripple wave
                dist = np.sqrt((c - cols/2)**2 + (r - rows/2)**2)
                phase = np.sin(dist * 0.5 - p * 2 * np.pi * 2)
                size = int(22 + phase * 10)
                
                # Pastel palette
                ratio = (phase + 1) / 2
                col = (int(255 * ratio + 100 * (1-ratio)), int(180 * (1-ratio) + 80), int(220 * ratio))
                cv2.rectangle(img, (bx - size, by - size), (bx + size, by + size), col, -1)
                cv2.rectangle(img, (bx - size, by - size), (bx + size, by + size), (255, 255, 255), 1)

        writer.write(img)
    writer.release()
    encode_mp4(temp_raw, final_out)

# 05: Zen Sand Mandala
def gen_sand_mandala():
    final_out = os.path.join(out_dir, "05_zen_sand_mandala.mp4")
    temp_raw = final_out.replace(".mp4", "_raw.mp4")
    writer = cv2.VideoWriter(temp_raw, cv2.VideoWriter_fourcc(*'mp4v'), fps, (width, height))
    cx, cy = width // 2, height // 2

    # Canvas persistence for drawing path
    canvas = np.zeros((height, width, 3), dtype=np.uint8)
    canvas[:] = (18, 16, 22) # Dark zen slate

    # Pre-render full spirograph path
    t_full = np.linspace(0, 20*np.pi, 2000)
    R, r_sp, d_sp = 380, 140, 220
    all_x = (cx + (R - r_sp) * np.cos(t_full) + d_sp * np.cos((R - r_sp) * t_full / r_sp)).astype(np.int32)
    all_y = (cy + (R - r_sp) * np.sin(t_full) - d_sp * np.sin((R - r_sp) * t_full / r_sp)).astype(np.int32)
    pts_all = np.stack([all_x, all_y], axis=1)

    for f in range(total_frames):
        p = f / total_frames
        img = canvas.copy()

        # Draw accumulated lines up to current point with glowing golden fade
        cur_idx = int(p * len(pts_all))
        # Draw base mandala outline softly
        cv2.polylines(img, [pts_all], True, (50, 45, 65), 2, cv2.LINE_AA)
        
        # Highlight active leading trail
        trail_len = 350
        start_idx = max(0, cur_idx - trail_len)
        active_pts = pts_all[start_idx:cur_idx+1]
        if len(active_pts) > 1:
            cv2.polylines(img, [active_pts], False, (100, 215, 255), 5, cv2.LINE_AA)
            cv2.polylines(img, [active_pts], False, (255, 255, 255), 2, cv2.LINE_AA)

        # Leading steel ball
        lead_pt = pts_all[cur_idx % len(pts_all)]
        cv2.circle(img, (lead_pt[0], lead_pt[1]), 20, (180, 210, 240), -1)
        cv2.circle(img, (lead_pt[0] - 5, lead_pt[1] - 5), 6, (255, 255, 255), -1)

        writer.write(img)
    writer.release()
    encode_mp4(temp_raw, final_out)

print("Starting satisfying pack render...")
gen_sand_ripples()
gen_pendulum_wave()
gen_fluid_swirl()
gen_cube_cascade()
gen_sand_mandala()
