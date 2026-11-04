import cv2
import os

folder = r"C:\NexusCut\MP4 Stress Test Pack\Medium Clips (1–5 minutes)"
for f in os.listdir(folder):
    if f.endswith('.mp4'):
        cap = cv2.VideoCapture(os.path.join(folder, f))
        ret, frame = cap.read()
        if ret:
            h, w, c = frame.shape
            fps = cap.get(cv2.CAP_PROP_FPS)
            count = cap.get(cv2.CAP_PROP_FRAME_COUNT)
            duration = count / (fps if fps > 0 else 30)
            print(f"{f}: {w}x{h} @ {fps:.1f}fps, {duration:.1f}s")
        cap.release()
