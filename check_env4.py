import re

with open(r"C:\Users\Serge\.gemini\antigravity\brain\919ad89a-1e07-495b-958f-471a226ba2b6\.system_generated\steps\5618\content.md", "r", encoding="utf-8") as f:
    content = f.read()

matches = re.findall(r'price_[a-zA-Z0-9]+', content)
print("Found price IDs:", set(matches))

