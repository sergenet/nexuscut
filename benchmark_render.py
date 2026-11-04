import cv2
import numpy as np
import time

width, height = 1080, 1920
fps = 60
num_frames = 60 # 1 second test

t0 = time.time()
writer = cv2.VideoWriter(r"C:\NexusCut\scratch\test_benchmark.mp4", cv2.VideoWriter_fourcc(*'mp4v'), fps, (width, height))

for i in range(num_frames):
    img = np.zeros((height, width, 3), dtype=np.uint8)
    # Draw simple gradient and moving lines
    y_offset = (i * 10) % 100
    cv2.line(img, (0, 960 + y_offset), (1080, 960 + y_offset), (255, 0, 255), 4)
    cv2.circle(img, (540, 500), 200, (0, 200, 255), -1)
    writer.write(img)

writer.release()
t1 = time.time()
print(f"60 frames rendered in {t1 - t0:.2f} seconds ({60 / (t1 - t0):.1f} fps)")
