import sys
from rembg import remove
from PIL import Image

def process_image(input_path, output_path):
    print(f"Starting Background Removal for Image: {input_path}")
    try:
        input_image = Image.open(input_path)
        output_image = remove(input_image)
        output_image.save(output_path, "PNG")
        print("Image background removal complete!")
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python remove_bg_image.py <input> <output>")
        sys.exit(1)
        
    process_image(sys.argv[1], sys.argv[2])
