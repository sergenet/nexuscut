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

# 06: Wireframe Canyon Runner
def gen_canyon_runner():
    final_out = os.path.join(out_dir, "06_wireframe_canyon_runner.mp4")
    temp_raw = final_out.replace(".mp4", "_raw.mp4")
    writer = cv2.VideoWriter(temp_raw, cv2.VideoWriter_fourcc(*'mp4v'), fps, (width, height))
    cx, cy = width // 2, int(height * 0.5)

    for f in range(total_frames):
        p = f / total_frames
        img = np.zeros((height, width, 3), dtype=np.uint8)
        img[:] = (8, 4, 16) # Deep midnight purple

        # Canyon walls weaving with sinusoidal banking
        num_ribs = 20
        bank_angle = np.sin(p * 2 * np.pi * 2) * 200

        for i in range(num_ribs):
            z = ((i + (p * 4) % 1.0) / num_ribs) ** 2.2
            if z < 0.02: continue

            c_center = int(cx + np.sin(p * 2 * np.pi * 2 + (1 - z) * 3) * (z * 250))
            c_gap = int(120 * (1 - z) + 380 * z)
            top_y = int(cy - z * 850)
            bot_y = int(cy + z * 850)

            # Left canyon wall
            lx = c_center - c_gap
            rx = c_center + c_gap
            
            # Draw wireframe wall ribs
            col = (int(255 * z), int(50 * (1 - z)), int(220 * z))
            cv2.line(img, (lx, top_y), (lx, bot_y), col, max(1, int(3 * z)), cv2.LINE_AA)
            cv2.line(img, (rx, top_y), (rx, bot_y), col, max(1, int(3 * z)), cv2.LINE_AA)
            
            # Floor crossbar
            cv2.line(img, (lx, bot_y), (rx, bot_y), (int(240 * z), int(200 * z), 40), max(1, int(2 * z)), cv2.LINE_AA)

        writer.write(img)
    writer.release()
    encode_mp4(temp_raw, final_out)

# 07: Arcade Speed Boost Track
def gen_arcade_boost():
    final_out = os.path.join(out_dir, "07_arcade_speed_boost_track.mp4")
    temp_raw = final_out.replace(".mp4", "_raw.mp4")
    writer = cv2.VideoWriter(temp_raw, cv2.VideoWriter_fourcc(*'mp4v'), fps, (width, height))
    cx = width // 2
    horizon_y = int(height * 0.38)

    for f in range(total_frames):
        p = f / total_frames
        img = np.zeros((height, width, 3), dtype=np.uint8)
        img[:horizon_y] = (15, 10, 30)
        img[horizon_y:] = (12, 16, 20)

        # Chevrons rushing forward
        num_gates = 8
        for i in range(num_gates):
            z = ((i + (p * 3) % 1.0) / num_gates) ** 2.4
            if z < 0.05: continue

            gy = int(horizon_y + z * (height - horizon_y))
            gw = int(z * 700)
            gh = int(z * 350)
            
            # Pulsing Chevron arrow
            col = (0, 255, 255) if (i % 2 == 0) else (255, 50, 255)
            pts = np.array([
                [cx - gw, gy], [cx, gy - gh], [cx + gw, gy],
                [cx + gw - int(z*60), gy], [cx, gy - gh + int(z*60)], [cx - gw + int(z*60), gy]
            ], np.int32)
            cv2.fillPoly(img, [pts], col)

        writer.write(img)
    writer.release()
    encode_mp4(temp_raw, final_out)

# 08: Quantum Particle Accelerator
def gen_particle_accelerator():
    final_out = os.path.join(out_dir, "08_quantum_particle_accelerator.mp4")
    temp_raw = final_out.replace(".mp4", "_raw.mp4")
    writer = cv2.VideoWriter(temp_raw, cv2.VideoWriter_fourcc(*'mp4v'), fps, (width, height))
    cx, cy = width // 2, height // 2

    num_particles = 120
    np.random.seed(999)
    angles_init = np.random.uniform(0, 2*np.pi, num_particles)
    radii = np.random.uniform(180, 500, num_particles)
    speeds = np.random.uniform(1.5, 4.0, num_particles)
    palette = [(255, 230, 0), (0, 240, 255), (255, 0, 220), (255, 255, 255)]
    color_indices = np.random.choice(len(palette), size=num_particles)
    colors = [palette[idx] for idx in color_indices]

    for f in range(total_frames):
        p = f / total_frames
        img = np.zeros((height, width, 3), dtype=np.uint8)
        
        # Central reactor rings
        for ring_r in [120, 240, 380, 520]:
            cv2.circle(img, (cx, cy), ring_r, (40, 30, 60), 2, cv2.LINE_AA)
            cv2.circle(img, (cx, cy), ring_r + int(np.sin(p * 2 * np.pi * 3) * 6), (120, 40, 180), 1, cv2.LINE_AA)

        # High-speed orbiting particles with streak tails
        for i in range(num_particles):
            cur_angle = angles_init[i] + p * 2 * np.pi * speeds[i]
            r = radii[i]
            x = int(cx + r * np.cos(cur_angle))
            y = int(cy + r * np.sin(cur_angle) * 1.5) # Oval perspective
            
            # Streak tail
            tail_angle = cur_angle - 0.25
            tx = int(cx + r * np.cos(tail_angle))
            ty = int(cy + r * np.sin(tail_angle) * 1.5)
            cv2.line(img, (tx, ty), (x, y), tuple(int(c) for c in colors[i]), 3, cv2.LINE_AA)
            cv2.circle(img, (x, y), 5, (255, 255, 255), -1)

        writer.write(img)
    writer.release()
    encode_mp4(temp_raw, final_out)

# 09: Hyperspeed Starfield Warp
def gen_starfield_warp():
    final_out = os.path.join(out_dir, "09_hyperspeed_starfield.mp4")
    temp_raw = final_out.replace(".mp4", "_raw.mp4")
    writer = cv2.VideoWriter(temp_raw, cv2.VideoWriter_fourcc(*'mp4v'), fps, (width, height))
    cx, cy = width // 2, height // 2

    num_stars = 350
    np.random.seed(42)
    s_angles = np.random.uniform(0, 2*np.pi, num_stars)
    s_speeds = np.random.uniform(0.5, 1.5, num_stars)
    s_offsets = np.random.uniform(0, 1.0, num_stars)

    for f in range(total_frames):
        p = f / total_frames
        img = np.zeros((height, width, 3), dtype=np.uint8)

        for i in range(num_stars):
            sp = (s_offsets[i] + p * s_speeds[i] * 3) % 1.0
            z = sp ** 2.2
            r = z * 1200
            if r < 10: continue

            x2 = int(cx + r * np.cos(s_angles[i]))
            y2 = int(cy + r * np.sin(s_angles[i]))
            # Tail
            tail_r = max(5, r - int(10 + z * 140))
            x1 = int(cx + tail_r * np.cos(s_angles[i]))
            y1 = int(cy + tail_r * np.sin(s_angles[i]))

            brightness = int(50 + 205 * z)
            col = (brightness, int(brightness * 0.9), 255)
            thickness = max(1, int(1 + 4 * z))
            cv2.line(img, (x1, y1), (x2, y2), col, thickness, cv2.LINE_AA)

        writer.write(img)
    writer.release()
    encode_mp4(temp_raw, final_out)

# 10: Cyber Obstacle Course
def gen_obstacle_course():
    final_out = os.path.join(out_dir, "10_cyber_obstacle_run.mp4")
    temp_raw = final_out.replace(".mp4", "_raw.mp4")
    writer = cv2.VideoWriter(temp_raw, cv2.VideoWriter_fourcc(*'mp4v'), fps, (width, height))
    cx = width // 2
    cy = int(height * 0.55)

    for f in range(total_frames):
        p = f / total_frames
        img = np.zeros((height, width, 3), dtype=np.uint8)
        img[:cy] = (25, 8, 18)
        img[cy:] = (12, 10, 18)

        # Weaving camera motion
        cam_shift = int(np.sin(p * 2 * np.pi * 3) * 180)

        # Floating laser obstacles
        num_obs = 10
        for i in range(num_obs):
            z = ((i + (p * 3) % 1.0) / num_obs) ** 2.3
            if z < 0.05: continue

            oy = int(cy + (1 - z) * 50 - z * 350)
            ow = int(z * 550)
            oh = int(z * 400)
            ox = cx + cam_shift + (int(np.sin(i * 3.7) * 200) if i % 2 == 0 else -int(np.sin(i * 3.7) * 200))

            # Draw laser gate
            col = (0, 240, 255) if (i % 2 == 0) else (255, 30, 220)
            cv2.rectangle(img, (ox - ow//2, oy - oh//2), (ox + ow//2, oy + oh//2), col, max(2, int(6 * z)))
            # Inner pulse
            cv2.line(img, (ox - ow//2, oy), (ox + ow//2, oy), (255, 255, 255), max(1, int(3 * z)), cv2.LINE_AA)

        writer.write(img)
    writer.release()
    encode_mp4(temp_raw, final_out)

print("Starting render of gameplay pack part 2...")
# gen_canyon_runner()
# gen_arcade_boost()
gen_particle_accelerator()
gen_starfield_warp()
gen_obstacle_course()
