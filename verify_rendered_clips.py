import os

gameplay_dir = r"C:\NexusCut\scratch\gameplay_clips"
satisfying_dir = r"C:\NexusCut\scratch\satisfying_clips"

print("=== GAMEPLAY CLIPS ===")
for f in sorted(os.listdir(gameplay_dir)):
    p = os.path.join(gameplay_dir, f)
    print(f"{f}: {os.path.getsize(p) / 1024 / 1024:.2f} MB")

print("\n=== SATISFYING CLIPS ===")
for f in sorted(os.listdir(satisfying_dir)):
    p = os.path.join(satisfying_dir, f)
    print(f"{f}: {os.path.getsize(p) / 1024 / 1024:.2f} MB")
