import cv2
import numpy as np
import subprocess
import os

width, height = 1080, 1920
fps = 60
duration_sec = 10
total_frames = fps * duration_sec
ffmpeg_bin = r"C:\NexusCut\node_modules\ffmpeg-static\ffmpeg.exe"

out_dir = r"C:\NexusCut\scratch\gameplay_clips"
os.makedirs(out_dir, exist_ok=True)

def encode_mp4(temp_raw, final_out):
    cmd = f'"{ffmpeg_bin}" -y -i "{temp_raw}" -c:v libx264 -preset fast -b:v 8000k -pix_fmt yuv420p "{final_out}"'
    subprocess.run(cmd, shell=True, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    if os.path.exists(temp_raw):
        os.remove(temp_raw)
    print(f"Generated: {os.path.basename(final_out)} ({os.path.getsize(final_out) / 1024 / 1024:.2f} MB)")

# 01: Synthwave Highway Dash (already done, copy over)
if os.path.exists(r"C:\NexusCut\scratch\01_synthwave_highway_dash.mp4"):
    import shutil
    shutil.copy(r"C:\NexusCut\scratch\01_synthwave_highway_dash.mp4", os.path.join(out_dir, "01_synthwave_highway_dash.mp4"))
    print("Copied 01_synthwave_highway_dash.mp4")

# 02: Cyberpunk Hyperspace Hex Tunnel
def gen_hex_tunnel():
    final_out = os.path.join(out_dir, "02_cyberpunk_hyperspace_tunnel.mp4")
    temp_raw = final_out.replace(".mp4", "_raw.mp4")
    writer = cv2.VideoWriter(temp_raw, cv2.VideoWriter_fourcc(*'mp4v'), fps, (width, height))
    cx, cy = width // 2, height // 2
    num_hex = 18

    for f in range(total_frames):
        p = f / total_frames
        img = np.zeros((height, width, 3), dtype=np.uint8)
        
        # Radial background glow
        y_grid, x_grid = np.ogrid[:height:10, :width:10]
        dist = np.sqrt((x_grid*10 - cx)**2 + (y_grid*10 - cy)**2)
        glow_mask = np.clip(1.0 - dist / 900.0, 0, 1)
        glow_layer = (glow_mask[:, :, None] * np.array([40, 10, 20])).astype(np.uint8)
        img[::10, ::10] = glow_layer
        img = cv2.resize(img[::10, ::10], (width, height), interpolation=cv2.INTER_LINEAR)

        # Concentric rushing hexagons
        for i in range(num_hex):
            z = ((i + (p * 3) % 1.0) / num_hex) ** 2.2
            radius = int(z * 1100)
            if radius < 5: continue
            
            # Rotation changes with depth
            rot = p * 2 * np.pi * 0.5 + z * 1.5
            angles = np.linspace(0, 2*np.pi, 7)[:-1] + rot
            pts = np.stack([cx + radius * np.cos(angles), cy + radius * np.sin(angles)], axis=1).astype(np.int32)
            
            # Color gradient: Cyan (center) to Hot Purple (outer)
            b = int(255 * (1 - z) + 200 * z)
            g = int(220 * (1 - z) + 10 * z)
            r = int(40 * (1 - z) + 255 * z)
            thickness = max(2, int(1 + 5 * z))
            cv2.polylines(img, [pts], True, (b, g, r), thickness, cv2.LINE_AA)

            # Connecting longitudinal ribs between corners
            if i % 3 == 0 and z > 0.1:
                for corner in pts:
                    cv2.line(img, (cx, cy), tuple(corner), (int(b*0.3), int(g*0.3), int(r*0.3)), 1, cv2.LINE_AA)

        writer.write(img)
    writer.release()
    encode_mp4(temp_raw, final_out)

# 03: Neon Drift Speedway
def gen_drift_speedway():
    final_out = os.path.join(out_dir, "03_neon_drift_speedway.mp4")
    temp_raw = final_out.replace(".mp4", "_raw.mp4")
    writer = cv2.VideoWriter(temp_raw, cv2.VideoWriter_fourcc(*'mp4v'), fps, (width, height))
    cx, cy = width // 2, height // 2

    for f in range(total_frames):
        p = f / total_frames
        img = np.zeros((height, width, 3), dtype=np.uint8)
        img[:] = (12, 10, 16) # Dark asphalt base

        # Sweeping circuit track curves
        t = np.linspace(0, 4*np.pi, 300)
        track_x = cx + (width * 0.38) * np.sin(t + p * 2 * np.pi) * np.cos(t * 0.5)
        track_y = cy + (height * 0.42) * np.sin(t * 0.5 + p * 2 * np.pi * 2)
        pts = np.stack([track_x, track_y], axis=1).astype(np.int32)
        
        # Track borders (glow)
        cv2.polylines(img, [pts], False, (255, 100, 0), 32, cv2.LINE_AA)
        cv2.polylines(img, [pts], False, (0, 230, 255), 8, cv2.LINE_AA)
        cv2.polylines(img, [pts], False, (255, 255, 255), 2, cv2.LINE_AA)

        # Drifting race cars with trailing particle ribbons
        for car_idx in range(4):
            car_phase = (p + car_idx * 0.25) % 1.0
            idx = int(car_phase * (len(pts) - 1))
            c_pos = pts[idx]
            # Drift angle
            next_idx = min(len(pts) - 1, idx + 3)
            dx = pts[next_idx][0] - pts[idx][0]
            dy = pts[next_idx][1] - pts[idx][1]
            angle = np.arctan2(dy, dx) + 0.35 # Drift slide angle

            # Draw car body
            car_w, car_l = 22, 45
            rect_pts = np.array([
                [-car_w//2, -car_l//2], [car_w//2, -car_l//2],
                [car_w//2, car_l//2], [-car_w//2, car_l//2]
            ])
            rot_mat = np.array([[np.cos(angle), -np.sin(angle)], [np.sin(angle), np.cos(angle)]])
            trans_pts = (rect_pts @ rot_mat.T + c_pos).astype(np.int32)
            cv2.fillPoly(img, [trans_pts], (0, 240, 255))
            
            # Tire sparks / neon trail
            for tr in range(1, 15):
                prev_idx = max(0, idx - tr * 2)
                t_pos = pts[prev_idx]
                alpha = (15 - tr) / 15.0
                cv2.circle(img, (int(t_pos[0]), int(t_pos[1])), int(6 * alpha), (int(255 * alpha), int(80 * alpha), int(20 * alpha)), -1)

        writer.write(img)
    writer.release()
    encode_mp4(temp_raw, final_out)

# 04: Matrix Digital Rain
def gen_matrix_rain():
    final_out = os.path.join(out_dir, "04_matrix_digital_rain.mp4")
    temp_raw = final_out.replace(".mp4", "_raw.mp4")
    writer = cv2.VideoWriter(temp_raw, cv2.VideoWriter_fourcc(*'mp4v'), fps, (width, height))
    
    num_cols = 40
    col_w = width // num_cols
    np.random.seed(1337)
    speeds = np.random.uniform(1.2, 2.5, num_cols)
    offsets = np.random.uniform(0, height, num_cols)
    trail_lens = np.random.randint(18, 35, num_cols)

    for f in range(total_frames):
        p = f / total_frames
        img = np.zeros((height, width, 3), dtype=np.uint8)

        for c in range(num_cols):
            x = c * col_w + col_w // 2
            # Head y position loops smoothly
            head_y = int((offsets[c] + p * speeds[c] * height * 2) % (height + 400)) - 100
            trail = trail_lens[c]

            for t in range(trail):
                y = head_y - t * 28
                if 0 <= y < height:
                    ratio = (trail - t) / trail
                    if t == 0: # Head character is bright glowing white
                        col = (220, 255, 220)
                        radius = 6
                    else:
                        g = int(255 * ratio)
                        col = (int(30 * ratio), g, int(20 * ratio))
                        radius = max(2, int(5 * ratio))
                    cv2.circle(img, (x, y), radius, col, -1)
                    # Vertical connector segment
                    cv2.line(img, (x, y - 10), (x, y + 10), col, 2, cv2.LINE_AA)

        writer.write(img)
    writer.release()
    encode_mp4(temp_raw, final_out)

# 05: Infinite Cyber City Corridor
def gen_city_rush():
    final_out = os.path.join(out_dir, "05_infinite_city_rush.mp4")
    temp_raw = final_out.replace(".mp4", "_raw.mp4")
    writer = cv2.VideoWriter(temp_raw, cv2.VideoWriter_fourcc(*'mp4v'), fps, (width, height))
    cx, cy = width // 2, int(height * 0.65)
    num_buildings = 14

    for f in range(total_frames):
        p = f / total_frames
        img = np.zeros((height, width, 3), dtype=np.uint8)
        img[:cy] = (18, 5, 12) # Dark cyber sky
        img[cy:] = (10, 8, 14) # Ground

        # Rushing buildings on left and right sides
        for i in range(num_buildings):
            z = ((i + (p * 4) % 1.0) / num_buildings) ** 2.2
            if z <= 0.01: continue
            
            b_width = int(z * 480)
            b_height = int(z * 950)
            
            # Left skyscraper
            lx1 = 0
            lx2 = int(cx - (1.0 - z) * 120 - 40 * z)
            ly1 = cy - b_height
            ly2 = cy + int(z * 200)
            
            # Window grid glow
            cv2.rectangle(img, (lx1, ly1), (lx2, ly2), (35, 20, 45), -1)
            cv2.rectangle(img, (lx1, ly1), (lx2, ly2), (255, 40, 180), max(1, int(4 * z)))
            # Neon billboards
            if i % 3 == 0:
                cv2.rectangle(img, (lx2 - int(z*120), ly1 + int(z*100)), (lx2 - int(z*20), ly1 + int(z*250)), (0, 240, 255), -1)

            # Right skyscraper
            rx1 = int(cx + (1.0 - z) * 120 + 40 * z)
            rx2 = width
            cv2.rectangle(img, (rx1, ly1), (rx2, ly2), (40, 22, 35), -1)
            cv2.rectangle(img, (rx1, ly1), (rx2, ly2), (0, 220, 255), max(1, int(4 * z)))
            if i % 2 == 0:
                cv2.rectangle(img, (rx1 + int(z*20), ly1 + int(z*140)), (rx1 + int(z*140), ly1 + int(z*320)), (255, 30, 200), -1)

        # Ground speed lines
        for s in range(12):
            sz = ((s + (p * 8) % 1.0) / 12) ** 2.0
            sy = int(cy + sz * (height - cy))
            sx = int(cx + np.sin(s * 99) * (sz * 300))
            cv2.line(img, (sx, sy), (sx, min(height, sy + int(sz * 50))), (255, 255, 255), max(2, int(sz * 4)), cv2.LINE_AA)

        writer.write(img)
    writer.release()
    encode_mp4(temp_raw, final_out)

print("Starting render of remaining gameplay clips...")
gen_hex_tunnel()
gen_drift_speedway()
gen_matrix_rain()
gen_city_rush()
