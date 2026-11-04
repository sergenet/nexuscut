import sys

with open('C:\\NexusCut\\mobile\\app\\editor.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Locate the leftover fragments and delete them
import re

# Match the leftover parts of the modal
modal_pattern = re.compile(r'\s*placeholderTextColor="#71717a".*?</View>\s*\)\}\s*</View>', re.DOTALL)

if modal_pattern.search(content):
    content = modal_pattern.sub('\n          </View>', content)
    with open('C:\\NexusCut\\mobile\\app\\editor.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Cleaned up remaining modal fragments")
else:
    print("No fragments found")
