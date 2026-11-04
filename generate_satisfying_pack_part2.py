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

# 06: Soap Cutting Geometric Grid
def gen_soap_cutting():
    final_out = os.path.join(out_dir, "06_soap_cutting_grid.mp4")
    temp_raw = final_out.replace(".mp4", "_raw.mp4")
    writer = cv2.VideoWriter(temp_raw, cv2.VideoWriter_fourcc(*'mp4v'), fps, (width, height))
    
    grid_rows, grid_cols = 16, 10
    block_w, block_h = width // grid_cols, height // grid_rows

    for f in range(total_frames):
        p = f / total_frames
        img = np.zeros((height, width, 3), dtype=np.uint8)
        
        # Blade cut sweeps downwards in loop
        cut_line_y = int(p * height * 1.2) - int(height * 0.1)

        for r in range(grid_rows):
            for c in range(grid_cols):
                bx = c * block_w
                by = r * block_h
                
                # Check if cut has reached this block
                if by < cut_line_y:
                    # Cut has peeled block slightly
                    peel = min(1.0, (cut_line_y - by) / 300.0)
                    offset_y = int(peel * 25)
                    # Pastel gradient
                    b = int(240 - c * 8)
                    g = int(180 + r * 4)
                    r_col = int(140 + (c + r) * 5)
                    cv2.rectangle(img, (bx + 3, by + offset_y + 3), (bx + block_w - 3, by + block_h + offset_y - 3), (b, g, r_col), -1)
                    cv2.rectangle(img, (bx + 3, by + offset_y + 3), (bx + block_w - 3, by + block_h + offset_y - 3), (255, 255, 255), 2)
                else:
                    # Uncut base block
                    b = int(200 - c * 6)
                    g = int(150 + r * 3)
                    r_col = int(110 + (c + r) * 4)
                    cv2.rectangle(img, (bx + 1, by + 1), (bx + block_w - 1, by + block_h - 1), (b, g, r_col), -1)
                    cv2.rectangle(img, (bx + 1, by + 1), (bx + block_w - 1, by + block_h - 1), (80, 60, 90), 1)

        # Glowing cutter line
        if 0 <= cut_line_y < height:
            cv2.line(img, (0, cut_line_y), (width, cut_line_y), (255, 255, 255), 4, cv2.LINE_AA)
            cv2.line(img, (0, cut_line_y), (width, cut_line_y), (0, 240, 255), 8, cv2.LINE_AA)

        writer.write(img)
    writer.release()
    encode_mp4(temp_raw, final_out)

# 07: Hypnotic Tunnel Vortex
def gen_tunnel_vortex():
    final_out = os.path.join(out_dir, "07_hypnotic_tunnel_vortex.mp4")
    temp_raw = final_out.replace(".mp4", "_raw.mp4")
    writer = cv2.VideoWriter(temp_raw, cv2.VideoWriter_fourcc(*'mp4v'), fps, (width, height))
    cx, cy = width // 2, height // 2
    num_rings = 24

    for f in range(total_frames):
        p = f / total_frames
        img = np.zeros((height, width, 3), dtype=np.uint8)

        for i in range(num_rings):
            z = ((i + (p * 2) % 1.0) / num_rings) ** 2.2
            if z < 0.02: continue

            r_outer = int(z * 1050)
            r_inner = max(0, int(r_outer - (z * 60)))
            
            # Alternating black, gold, and turquoise bands
            rot_offset = p * 2 * np.pi + z * 3
            if i % 2 == 0:
                col = (int(30 + 190 * z), int(160 * z), int(255 * z)) # Gold
            else:
                col = (int(255 * z), int(220 * z), int(40 * z)) # Turquoise
            
            cv2.circle(img, (cx, cy), r_outer, col, max(2, int(12 * z)), cv2.LINE_AA)

        writer.write(img)
    writer.release()
    encode_mp4(temp_raw, final_out)

# 08: Harmonic Ribbon Waves
def gen_ribbon_waves():
    final_out = os.path.join(out_dir, "08_harmonic_ribbon_waves.mp4")
    temp_raw = final_out.replace(".mp4", "_raw.mp4")
    writer = cv2.VideoWriter(temp_raw, cv2.VideoWriter_fourcc(*'mp4v'), fps, (width, height))
    
    num_ribbons = 14
    x_steps = np.linspace(0, width, 120)

    for f in range(total_frames):
        p = f / total_frames
        img = np.zeros((height, width, 3), dtype=np.uint8)
        img[:] = (20, 15, 28)

        for r in range(num_ribbons):
            base_y = int(height * (0.2 + (r / num_ribbons) * 0.6))
            phase_shift = r * 0.45 + p * 2 * np.pi * 2
            
            wave_y = base_y + 90 * np.sin(x_steps * 0.006 + phase_shift) + 40 * np.cos(x_steps * 0.012 - phase_shift)
            pts = np.stack([x_steps, wave_y], axis=1).astype(np.int32)
            
            # Gradient ribbon color
            ratio = r / num_ribbons
            b = int(255 * ratio + 60 * (1 - ratio))
            g = int(120 * (1 - ratio) + 80)
            r_col = int(230 * (1 - ratio) + 120 * ratio)
            
            cv2.polylines(img, [pts], False, (b, g, r_col), 6, cv2.LINE_AA)

        writer.write(img)
    writer.release()
    encode_mp4(temp_raw, final_out)

# 09: Acrylic Fluid Flow
def gen_fluid_flow():
    final_out = os.path.join(out_dir, "09_acrylic_paint_flow.mp4")
    temp_raw = final_out.replace(".mp4", "_raw.mp4")
    writer = cv2.VideoWriter(temp_raw, cv2.VideoWriter_fourcc(*'mp4v'), fps, (width, height))
    
    scale_down = 4
    sw, sh = width // scale_down, height // scale_down
    y_g, x_g = np.ogrid[:sh, :sw]

    for f in range(total_frames):
        p = f / total_frames
        # Multi-frequency turbulent flow simulation
        v1 = np.sin(x_g * 0.03 + p * 2 * np.pi) + np.cos(y_g * 0.03 + p * 2 * np.pi)
        v2 = np.sin((x_g + y_g) * 0.02 - p * 2 * np.pi * 2)
        v_comb = (v1 + v2) / 2.0
        
        hue = ((v_comb * 0.5 + p + 0.5) % 1.0) * 180
        sat = np.full_like(hue, 220, dtype=np.uint8)
        val = np.clip(160 + v_comb * 80, 80, 255).astype(np.uint8)

        hsv = np.stack([hue.astype(np.uint8), sat, val], axis=-1)
        bgr = cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)
        img = cv2.resize(bgr, (width, height), interpolation=cv2.INTER_LINEAR)
        writer.write(img)
    writer.release()
    encode_mp4(temp_raw, final_out)

# 10: Perpetual Marble Track
def gen_marble_track():
    final_out = os.path.join(out_dir, "10_perpetual_marble_track.mp4")
    temp_raw = final_out.replace(".mp4", "_raw.mp4")
    writer = cv2.VideoWriter(temp_raw, cv2.VideoWriter_fourcc(*'mp4v'), fps, (width, height))
    cx = width // 2

    # Track spirals down the screen
    t_track = np.linspace(0, 12 * np.pi, 600)
    track_y = np.linspace(150, 1770, 600)
    track_x = cx + 280 * np.sin(t_track)
    track_pts = np.stack([track_x, track_y], axis=1).astype(np.int32)

    for f in range(total_frames):
        p = f / total_frames
        img = np.zeros((height, width, 3), dtype=np.uint8)
        img[:] = (26, 20, 32) # Dark studio floor

        # Draw dual-rail track
        cv2.polylines(img, [track_pts - np.array([12, 0])], False, (140, 120, 160), 4, cv2.LINE_AA)
        cv2.polylines(img, [track_pts + np.array([12, 0])], False, (140, 120, 160), 4, cv2.LINE_AA)

        # Marbles rolling along the track
        num_marbles = 6
        for m in range(num_marbles):
            mp = (p + m / num_marbles) % 1.0
            idx = int(mp * (len(track_pts) - 1))
            mx, my = track_pts[idx]

            # Chrome / metallic marble with highlight
            cv2.circle(img, (mx, my), 22, (230, 240, 255), -1)
            cv2.circle(img, (mx - 6, my - 6), 6, (255, 255, 255), -1)
            cv2.circle(img, (mx, my), 24, (120, 100, 140), 2, cv2.LINE_AA)

        writer.write(img)
    writer.release()
    encode_mp4(temp_raw, final_out)

print("Starting satisfying pack part 2 render...")
gen_soap_cutting()
gen_tunnel_vortex()
gen_ribbon_waves()
gen_fluid_flow()
gen_marble_track()
