import json
import re

transcript_path = r"C:\Users\Serge\.gemini\antigravity\brain\892c6b0a-258c-4011-88cb-fab1545681ee\.system_generated\logs\transcript_full.jsonl"

file_history = {}
current_content = ""

try:
    with open(transcript_path, 'r', encoding='utf-8') as f:
        for line in f:
            try:
                data = json.loads(line.strip())
                if data.get('type') == 'PLANNER_RESPONSE':
                    tool_calls = data.get('tool_calls', [])
                    for call in tool_calls:
                        name = call.get('name')
                        if name in ['write_to_file', 'replace_file_content', 'multi_replace_file_content']:
                            args = call.get('args', {})
                            target = args.get('TargetFile', '')
                            if 'editor.tsx' in target:
                                if name == 'write_to_file':
                                    current_content = args.get('CodeContent', '')
                                    file_history[data['step_index']] = current_content
                                elif name == 'replace_file_content':
                                    target_content = args.get('TargetContent', '')
                                    replacement = args.get('ReplacementContent', '')
                                    if target_content in current_content:
                                        current_content = current_content.replace(target_content, replacement)
                                        file_history[data['step_index']] = current_content
                                elif name == 'multi_replace_file_content':
                                    chunks = args.get('ReplacementChunks', [])
                                    for chunk in chunks:
                                        target_content = chunk.get('TargetContent', '')
                                        replacement = chunk.get('ReplacementContent', '')
                                        if target_content in current_content:
                                            current_content = current_content.replace(target_content, replacement)
                                    file_history[data['step_index']] = current_content
            except Exception as e:
                pass
                
    # We want the content just before step 15285
    valid_steps = [k for k in file_history.keys() if k < 15285]
    if valid_steps:
        best_step = max(valid_steps)
        with open(r"C:\NexusCut\editor_recovered.tsx", 'w', encoding='utf-8') as out:
            out.write(file_history[best_step])
        print(f"Successfully reconstructed editor.tsx at step {best_step}!")
    else:
        print("No valid history found.")
except Exception as e:
    print(f"Error: {e}")
