import sys
import cv2
import numpy as np
import json

def process_video(input_path, output_path, rects_json):
    print(f"Starting AI Eraser for {input_path}")
    
    try:
        rects = json.loads(rects_json)
    except Exception as e:
        print("Invalid rects JSON")
        sys.exit(1)
        
    cap = cv2.VideoCapture(input_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    if fps == 0 or total_frames == 0:
        print("Invalid video file")
        sys.exit(1)

    # Use mp4v codec for temporary output
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
    
    # Create the static mask
    mask = np.zeros((height, width), dtype=np.uint8)
    for rect in rects:
        x = int(rect['x'])
        y = int(rect['y'])
        w = int(rect['w'])
        h = int(rect['h'])
        cv2.rectangle(mask, (x, y), (x + w, y + h), 255, -1)

    frame_count = 0
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
            
        frame_count += 1
        if frame_count % 10 == 0:
            print(f"Processing frame {frame_count}/{total_frames}...")

        # Process frame with OpenCV Inpainting
        # INPAINT_TELEA is generally faster and better for smooth gradients
        erased_frame = cv2.inpaint(frame, mask, 3, cv2.INPAINT_TELEA)
        
        out.write(erased_frame)

    cap.release()
    out.release()
    print("AI Eraser complete!")

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python eraser.py <input> <output> <rects_json>")
        sys.exit(1)
        
    process_video(sys.argv[1], sys.argv[2], sys.argv[3])
