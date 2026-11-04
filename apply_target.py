import re

file_path = r"C:\NexusCut\mobile\app\editor.tsx"
target_path = r"C:\NexusCut\step_15285_target.tsx"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()
    
with open(target_path, 'r', encoding='utf-8') as f:
    target_content = f.read()

start_marker = "      {/* Main Content Area"
end_marker = "      {/* Bottom Timeline Area */}"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx == -1 or end_idx == -1:
    print("Could not find markers in editor.tsx")
    exit(1)

# The target_content already includes the start marker and ends right before the Bottom Timeline Area.
new_content = content[:start_idx] + target_content + "\n" + content[end_idx:]

# Also, ensure we don't have the old formatTime error in the target_content
new_content = new_content.replace("{formatTime(currentTime)} / {formatTime(duration)}", "{formatTime(currentTime)} / {formatTime(videoDuration)}")
new_content = new_content.replace("00:00:00 / 00:00:00", "{formatTime(currentTime)} / {formatTime(videoDuration)}")
new_content = new_content.replace("onPress={togglePlayPause}", "onPress={() => setIsPlaying(!isPlaying)}")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Restored exact original layout from step 15285!")
