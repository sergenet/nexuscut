import cv2
import numpy as np
import subprocess
import os

width, height = 1080, 1920
fps = 60
duration_sec = 10
total_frames = fps * duration_sec

temp_raw = r"C:\NexusCut\scratch\synthwave_raw.mp4"
final_out = r"C:\NexusCut\scratch\01_synthwave_highway_dash.mp4"

# Use OpenCV VideoWriter
fourcc = cv2.VideoWriter_fourcc(*'mp4v')
out = cv2.VideoWriter(temp_raw, fourcc, fps, (width, height))

# Horizon position
horizon_y = int(height * 0.45)
road_top_w = 40
road_bot_w = 900
road_center_x = width // 2

# Starfield coordinates
np.random.seed(42)
num_stars = 200
star_x = np.random.randint(0, width, num_stars)
star_y = np.random.randint(0, horizon_y, num_stars)
star_brightness = np.random.randint(120, 255, num_stars)

for f in range(total_frames):
    progress = f / total_frames
    img = np.zeros((height, width, 3), dtype=np.uint8)

    # 1. Sky Gradient (Deep Dark Indigo to Purple)
    for y in range(horizon_y):
        ratio = y / horizon_y
        r = int(10 + ratio * 40)
        g = int(5 + ratio * 15)
        b = int(25 + ratio * 80)
        img[y, :] = (b, g, r)

    # 2. Stars with subtle twinkle
    for i in range(num_stars):
        twinkle = int(star_brightness[i] * (0.8 + 0.2 * np.sin(progress * 2 * np.pi * 3 + i)))
        cv2.circle(img, (star_x[i], star_y[i]), 1, (twinkle, twinkle, twinkle), -1)

    # 3. Synthwave Glowing Sun
    sun_center = (road_center_x, horizon_y - 120)
    sun_radius = 160
    # Sun glow
    for r in range(sun_radius + 40, sun_radius, -4):
        alpha = (sun_radius + 40 - r) / 40.0 * 0.3
        cv2.circle(img, sun_center, r, (int(40 * alpha), int(120 * alpha), int(255 * alpha)), 2)
    # Sun body with gradient (Yellow at top to Hot Pink at bottom)
    for y in range(sun_center[1] - sun_radius, sun_center[1] + sun_radius):
        if 0 <= y < horizon_y:
            dy = y - sun_center[1]
            dx_max = int(np.sqrt(max(0, sun_radius**2 - dy**2)))
            if dx_max > 0:
                # Sun horizontal stripes (classic 80s blind effect)
                stripe_phase = (y - (sun_center[1] - sun_radius)) % 22
                stripe_gap = max(2, int((y - (sun_center[1] - sun_radius)) / sun_radius * 8))
                if stripe_phase >= stripe_gap:
                    ratio = (y - (sun_center[1] - sun_radius)) / (2 * sun_radius)
                    # BGR: Yellow (0, 230, 255) to Magenta (220, 20, 255)
                    b_col = int(ratio * 220)
                    g_col = int((1 - ratio) * 230 + 20)
                    r_col = 255
                    cv2.line(img, (sun_center[0] - dx_max, y), (sun_center[0] + dx_max, y), (b_col, g_col, r_col), 1)

    # 4. Wireframe Mountain Ridge on Horizon
    mount_pts = []
    for x in range(0, width + 40, 40):
        # Sine combination for mountain silhouette
        h_val = int(70 * np.sin(x * 0.015) + 40 * np.sin(x * 0.035 + 1.2))
        h_val = max(15, h_val)
        mount_pts.append((x, horizon_y - h_val))
    for i in range(len(mount_pts) - 1):
        # Draw mountain line
        cv2.line(img, mount_pts[i], mount_pts[i+1], (230, 80, 180), 2, cv2.LINE_AA)
        cv2.line(img, mount_pts[i], (mount_pts[i][0], horizon_y), (80, 20, 60), 1)

    # 5. Moving Perspective Grid (The Synthwave Highway)
    # Ground background (Deep dark violet)
    img[horizon_y:, :] = (20, 8, 12)

    # Longitudinal lines (fanning out towards camera)
    num_grid_lines = 14
    for i in range(-num_grid_lines // 2, num_grid_lines // 2 + 1):
        norm = i / (num_grid_lines / 2)
        top_x = int(road_center_x + norm * road_top_w)
        bot_x = int(road_center_x + norm * (road_bot_w * 1.6))
        # Color: Cyan for center road, hot magenta for outer grid
        if abs(i) <= 1:
            line_col = (255, 255, 0) # Cyan in BGR
            thickness = 3
        else:
            line_col = (230, 30, 220) # Magenta in BGR
            thickness = 2
        cv2.line(img, (top_x, horizon_y), (bot_x, height), line_col, thickness, cv2.LINE_AA)

    # Transverse lines (moving towards camera exponentially)
    num_transverse = 22
    for j in range(num_transverse):
        # Moving z: loop perfectly with progress
        z = ((j + (progress * 4) % 1.0) / num_transverse) ** 2.4
        grid_y = int(horizon_y + z * (height - horizon_y))
        if grid_y >= height or grid_y <= horizon_y:
            continue
        
        # Calculate road width at this y
        scale = z
        left_x = int(road_center_x - (road_top_w + scale * (road_bot_w * 1.6 - road_top_w)))
        right_x = int(road_center_x + (road_top_w + scale * (road_bot_w * 1.6 - road_top_w)))
        
        # Glow intensity increases as line approaches camera
        glow = int(120 + 135 * scale)
        cv2.line(img, (max(0, left_x), grid_y), (min(width, right_x), grid_y), (glow, int(glow * 0.3), glow), 2, cv2.LINE_AA)

    # 6. High-speed Light Streaks / Speed particles
    for k in range(12):
        lane_progress = ((progress * 6 + k * 0.17) % 1.0) ** 2.2
        py = int(horizon_y + lane_progress * (height - horizon_y))
        px_offset = np.sin(k * 77) * (road_top_w + lane_progress * (road_bot_w * 0.8))
        px = int(road_center_x + px_offset)
        length = int(15 + lane_progress * 45)
        cv2.line(img, (px, py), (px, min(height, py + length)), (255, 255, 255), 3, cv2.LINE_AA)

    out.write(img)

out.release()
print(f"Raw render done. Re-encoding with high-bitrate H.264...")
# Re-encode with ffmpeg locally or on VPS
ffmpeg_bin = r"C:\NexusCut\node_modules\ffmpeg-static\ffmpeg.exe"
cmd = f'"{ffmpeg_bin}" -y -i "{temp_raw}" -c:v libx264 -preset fast -b:v 8000k -pix_fmt yuv420p "{final_out}"'
subprocess.run(cmd, shell=True, check=True)
print(f"Successfully generated: {final_out} ({os.path.getsize(final_out) / 1024 / 1024:.2f} MB)")
