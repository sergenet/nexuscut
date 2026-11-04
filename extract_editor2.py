import json
import re

transcript_path = r"C:\Users\Serge\.gemini\antigravity\brain\892c6b0a-258c-4011-88cb-fab1545681ee\.system_generated\logs\transcript_full.jsonl"
output_path = r"C:\NexusCut\editor_recovered.tsx"

file_contents = {}

try:
    with open(transcript_path, 'r', encoding='utf-8') as f:
        for line in f:
            try:
                data = json.loads(line.strip())
                # If it's a tool response for view_file
                if data.get('type') == 'PLANNER_RESPONSE':
                    pass
                elif data.get('type') == 'SYSTEM' and 'response:default_api:view_file' in data.get('content', ''):
                    content = data['content']
                    lines = content.split('\n')
                    for l in lines[:5]:
                        if 'File Path:' in l:
                            print(f"Found view_file at step {data.get('step_index')}: {l}")
                            if 'editor.tsx' in l:
                                # Extract lines
                                editor_lines = []
                                for cl in lines:
                                    match = re.match(r'^\d+:\s(.*)', cl)
                                    if match:
                                        editor_lines.append(match.group(1))
                                if len(editor_lines) > 500:
                                    file_contents[data.get('step_index')] = '\n'.join(editor_lines)
            except Exception as e:
                pass
                
    if file_contents:
        # Get the highest step index before 15285
        valid_steps = [k for k in file_contents.keys() if k < 15285]
        if valid_steps:
            best_step = max(valid_steps)
            with open(output_path, 'w', encoding='utf-8') as out:
                out.write(file_contents[best_step])
            print(f"Successfully extracted editor.tsx from step {best_step}!")
        else:
            print("Found views, but none before 15285.")
            print("Available steps:", list(file_contents.keys()))
    else:
        print("Could not find any view_file of editor.tsx in transcript.")
except Exception as e:
    print(f"Error: {e}")
