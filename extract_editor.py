import json
import os

transcript_path = r"C:\Users\Serge\.gemini\antigravity\brain\892c6b0a-258c-4011-88cb-fab1545681ee\.system_generated\logs\transcript_full.jsonl"
output_path = r"C:\NexusCut\editor_extracted.tsx"

editor_content = ""

try:
    with open(transcript_path, 'r', encoding='utf-8') as f:
        for line in f:
            try:
                data = json.loads(line.strip())
                if data.get('type') == 'PLANNER_RESPONSE':
                    tool_calls = data.get('tool_calls', [])
                    for call in tool_calls:
                        if call.get('name') in ['write_to_file', 'replace_file_content', 'multi_replace_file_content']:
                            args = call.get('args', {})
                            target = args.get('TargetFile', '')
                            if 'editor.tsx' in target:
                                # if it's write_to_file, we get the whole content
                                if call.get('name') == 'write_to_file':
                                    content = args.get('CodeContent', '')
                                    if content:
                                        editor_content = content
                                        print(f"Found write_to_file at step {data.get('step_index')}")
                                elif call.get('name') == 'replace_file_content':
                                    print(f"Found replace_file_content at step {data.get('step_index')}")
            except Exception as e:
                pass
                
    if editor_content:
        with open(output_path, 'w', encoding='utf-8') as out:
            out.write(editor_content)
        print("Successfully extracted editor.tsx!")
    else:
        print("Could not find editor.tsx in transcript.")
except Exception as e:
    print(f"Error: {e}")
