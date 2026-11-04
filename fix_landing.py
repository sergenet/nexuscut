import shutil

# Copy recovered landing.html to dist
shutil.copy(r'C:\NexusCut\mobile\public\landing.html', r'C:\NexusCut\mobile\dist\landing.html')

# Apply the two fixes
content = open(r'C:\NexusCut\mobile\dist\landing.html', 'r', encoding='utf-8').read()

# Fix 1: footer Help link -> Tutorials + FAQ
old_footer = '<a href="/help">Help</a>'
new_footer = '<a href="#how-it-works">Tutorials</a><a href="#features">FAQ</a>'
content = content.replace(old_footer, new_footer)

# Fix 2: add id to how-it-works section
old_section = 'style="background: var(--bg2);">'
new_section = 'id="how-it-works" style="background: var(--bg2);">'
# Only replace the first occurrence (the how-it-works section)
content = content.replace(old_section, new_section, 1)

open(r'C:\NexusCut\mobile\dist\landing.html', 'w', encoding='utf-8').write(content)
print(f'landing.html updated ({len(content)} bytes)')

# Also save to public/ so future expo exports won't lose it
shutil.copy(r'C:\NexusCut\mobile\dist\landing.html', r'C:\NexusCut\mobile\public\landing.html')
print('Saved to public/ for persistence')
