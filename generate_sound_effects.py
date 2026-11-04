import os
import shutil
import numpy as np
import wave
import subprocess

sfx_dir = r"C:\NexusCut\scratch\hormozi_suite\Sound_Effects"
ffmpeg_bin = r"C:\NexusCut\node_modules\ffmpeg-static\ffmpeg.exe"
sample_rate = 44100

def save_wav(filename, samples):
    # Normalize to 16-bit PCM
    samples = np.clip(samples, -0.98, 0.98)
    int_samples = (samples * 32767).astype(np.int16)
    path_wav = os.path.join(sfx_dir, filename)
    with wave.open(path_wav, 'w') as wf:
        wf.setnchannels(1) # mono
        wf.setsampwidth(2) # 16-bit
        wf.setframerate(sample_rate)
        wf.writeframes(int_samples.tobytes())
    
    # Also create MP3 version
    path_mp3 = path_wav.replace(".wav", ".mp3")
    cmd = f'"{ffmpeg_bin}" -y -i "{path_wav}" -b:a 192k "{path_mp3}"'
    subprocess.run(cmd, shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(f"Created SFX: {filename}")

# Copy existing ones
src_sounds = r"C:\NexusCut\public\sounds"
pairs = [
    ("pop.wav", "01_clean_pop.wav"),
    ("whoosh.wav", "03_fast_swoosh.wav"),
    ("ding.wav", "04_bell_ding.wav"),
    ("boom.wav", "05_impact_boom.wav"),
]
for src_f, dst_f in pairs:
    src_p = os.path.join(src_sounds, src_f)
    dst_wav = os.path.join(sfx_dir, dst_f)
    shutil.copy(src_p, dst_wav)
    dst_mp3 = dst_wav.replace(".wav", ".mp3")
    cmd = f'"{ffmpeg_bin}" -y -i "{dst_wav}" -b:a 192k "{dst_mp3}"'
    subprocess.run(cmd, shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(f"Copied & converted SFX: {dst_f}")

# 02: Bubble Pop (resonant upward-to-downward chirp)
t = np.linspace(0, 0.08, int(sample_rate * 0.08))
freq = 700 + 400 * np.sin(t * np.pi / 0.08)
phase = np.cumsum(2 * np.pi * freq / sample_rate)
env = np.exp(-t * 50)
bubble = np.sin(phase) * env
save_wav("02_bubble_pop.wav", bubble)

# 06: Sub Bass Drop (deep 70Hz -> 30Hz exponential sweep)
t = np.linspace(0, 0.8, int(sample_rate * 0.8))
freq = 75 * np.exp(-t * 2.2) + 28
phase = np.cumsum(2 * np.pi * freq / sample_rate)
env = np.exp(-t * 2.5) * (1 - np.exp(-t * 80))
sub = np.sin(phase) * env * 0.95
save_wav("06_sub_bass_drop.wav", sub)

# 07: Mechanical Click (tactile high-frequency impulse)
t = np.linspace(0, 0.04, int(sample_rate * 0.04))
noise = np.random.uniform(-1, 1, len(t))
click = (np.sin(2 * np.pi * 3200 * t) * 0.7 + noise * 0.3) * np.exp(-t * 120)
save_wav("07_mechanical_click.wav", click)

# 08: Whip Swoosh (broadband filtered sweep)
t = np.linspace(0, 0.22, int(sample_rate * 0.22))
noise = np.random.uniform(-1, 1, len(t))
envelope = np.sin(np.pi * t / 0.22) ** 2
freq_mod = np.sin(np.pi * t / 0.22) * 1800 + 200
whip = (np.sin(2 * np.pi * freq_mod * t) * 0.6 + noise * 0.4) * envelope * 0.9
save_wav("08_whip_swoosh.wav", whip)

print("SFX generation complete!")
