from pathlib import Path

import cv2
import numpy as np


ROOT = Path(__file__).parent


for video_path in (ROOT / "desktop-audio.mp4", ROOT / "mobile-audio.mp4"):
    capture = cv2.VideoCapture(str(video_path))
    frame_count = int(capture.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = capture.get(cv2.CAP_PROP_FPS) or 30
    duration = frame_count / fps
    samples = np.linspace(0, max(frame_count - 1, 0), 16, dtype=int)
    frames = []
    for frame_number in samples:
        capture.set(cv2.CAP_PROP_POS_FRAMES, int(frame_number))
        ok, frame = capture.read()
        if not ok:
            continue
        height, width = frame.shape[:2]
        scale = min(360 / width, 260 / height)
        resized = cv2.resize(frame, (int(width * scale), int(height * scale)))
        canvas = np.full((300, 400, 3), 245, dtype=np.uint8)
        y = 25 + (260 - resized.shape[0]) // 2
        x = (400 - resized.shape[1]) // 2
        canvas[y:y + resized.shape[0], x:x + resized.shape[1]] = resized
        seconds = frame_number / fps
        cv2.putText(canvas, f"{seconds:.1f}s", (12, 22), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 0, 0), 1, cv2.LINE_AA)
        frames.append(canvas)
    capture.release()
    rows = [np.hstack(frames[index:index + 4]) for index in range(0, len(frames), 4)]
    sheet = np.vstack(rows)
    cv2.imwrite(str(ROOT / f"{video_path.stem}-contact.png"), sheet)
    print(f"{video_path.name}: {duration:.2f}s, {frame_count} frames, {fps:.2f} fps")

    detailed_times = range(55, 104, 5) if video_path.stem.startswith("desktop") else range(0, 59, 5)
    capture = cv2.VideoCapture(str(video_path))
    for second in detailed_times:
        capture.set(cv2.CAP_PROP_POS_MSEC, second * 1000)
        ok, frame = capture.read()
        if ok:
            cv2.imwrite(str(ROOT / f"{video_path.stem}-{second:03d}s.png"), frame)
    capture.release()
