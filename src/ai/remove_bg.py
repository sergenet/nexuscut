import sys
import cv2
import numpy as np
from rembg import remove
import os

def process_video(input_path, output_path):
    print(f"Starting Background Removal for {input_path}")
    
    cap = cv2.VideoCapture(input_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    if fps == 0 or total_frames == 0:
        print("Invalid video file")
        sys.exit(1)

    # Use mp4v codec for temporary output (OpenCV doesn't support alpha channel well in MP4)
    # We will output a video where the background is completely GREEN (#00FF00)
    # This allows FFmpeg to easily chromakey it later if needed, or we just serve the green screen!
    # Wait, actually let's just make the background green.
    
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

    frame_count = 0
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
            
        frame_count += 1
        if frame_count % 10 == 0:
            print(f"Processing frame {frame_count}/{total_frames}...")

        # Process frame with RemBG (returns RGBA)
        result_rgba = remove(frame)
        
        # Extract alpha channel
        alpha = result_rgba[:, :, 3]

        # Fix flickering by keeping only the largest connected component
        _, binary_mask = cv2.threshold(alpha, 127, 255, cv2.THRESH_BINARY)
        contours, _ = cv2.findContours(binary_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if contours:
            largest_contour = max(contours, key=cv2.contourArea)
            clean_mask = np.zeros_like(alpha)
            cv2.drawContours(clean_mask, [largest_contour], -1, 255, thickness=cv2.FILLED)
            # Apply the clean mask to remove small flickering objects
            alpha = cv2.bitwise_and(alpha, clean_mask)
        
        # Create a green background
        green_bg = np.zeros_like(frame)
        green_bg[:] = (0, 255, 0) # BGR
        
        # Blend the foreground with the green background
        alpha_factor = alpha[:, :, np.newaxis] / 255.0
        foreground = result_rgba[:, :, :3]
        
        composite = (foreground * alpha_factor + green_bg * (1 - alpha_factor)).astype(np.uint8)
        
        out.write(composite)

    cap.release()
    out.release()
    print("Background removal complete!")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python remove_bg.py <input> <output>")
        sys.exit(1)
        
    process_video(sys.argv[1], sys.argv[2])
