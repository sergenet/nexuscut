import re

with open('mobile/app/editor.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix styles.emptyStateText -> styles.emptyStateSubtext
content = content.replace('styles.emptyStateText', 'styles.emptyStateSubtext')

# Fix duplicated properties in styles object
style_start = content.find('const styles = StyleSheet.create({')
if style_start != -1:
    before_styles = content[:style_start]
    styles_content = content[style_start:]
    
    # We will just write a simple parser to grab top-level keys
    # or just use a regex to find all keys
    keys_seen = set()
    out_lines = []
    
    # Actually it's easier to just do it via regex line by line
    # A property starts with \s\s[a-zA-Z0-9_]+: {
    lines = styles_content.split('\n')
    
    cleaned_lines = []
    i = 0
    while i < len(lines):
        line = lines[i]
        match = re.match(r'^  ([a-zA-Z0-9_]+): {', line)
        if match:
            key = match.group(1)
            # read the block
            block = [line]
            i += 1
            brace_count = 1
            while i < len(lines) and brace_count > 0:
                block.append(lines[i])
                if '{' in lines[i]: brace_count += lines[i].count('{')
                if '}' in lines[i]: brace_count -= lines[i].count('}')
                i += 1
                
            if key not in keys_seen:
                keys_seen.add(key)
                cleaned_lines.extend(block)
        else:
            cleaned_lines.append(line)
            i += 1
            
    with open('mobile/app/editor.tsx', 'w', encoding='utf-8') as f:
        f.write(before_styles + '\n'.join(cleaned_lines))
    print('Fixed editor.tsx')

