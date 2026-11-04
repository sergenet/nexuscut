import cv2
import os

folder = r"C:\NexusCut\MP4 Stress Test Pack\Short Clips (10–30 seconds)"
for f in os.listdir(folder):
    if f.endswith('.mp4'):
        cap = cv2.VideoCapture(os.path.join(folder, f))
        ret, frame = cap.read()
        if ret:
            # save thumbnail to inspect
            out_name = f.replace('.mp4', '_thumb.jpg')
            cv2.imwrite(os.path.join(r"C:\NexusCut\scratch", out_name), frame)
            print(f"Saved thumb for {f}")
        cap.release()
