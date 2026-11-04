import cv2
import os

folder = r"C:\NexusCut\public\marketplace"
for f in os.listdir(folder):
    if f.endswith(('.jpg', '.png')):
        p = os.path.join(folder, f)
        img = cv2.imread(p)
        if img is not None:
            h, w, c = img.shape
            print(f"{f}: {w}x{h}")
