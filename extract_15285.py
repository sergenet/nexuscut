import json

transcript_path = r"C:\Users\Serge\.gemini\antigravity\brain\892c6b0a-258c-4011-88cb-fab1545681ee\.system_generated\logs\transcript_full.jsonl"
output_path = r"C:\NexusCut\step_15285_target.tsx"

found = False
try:
    with open(transcript_path, 'r', encoding='utf-8') as f:
        for line in f:
            data = json.loads(line.strip())
            if data.get('step_index') == 15285:
                if data.get('type') == 'PLANNER_RESPONSE':
                    tool_calls = data.get('tool_calls', [])
                    for call in tool_calls:
                        if call.get('name') == 'replace_file_content':
                            args = call.get('args', {})
                            target = args.get('TargetContent', '')
                            with open(output_path, 'w', encoding='utf-8') as out:
                                out.write(target)
                            print("Successfully extracted TargetContent of step 15285!")
                            found = True
                            break
            if found:
                break
except Exception as e:
    print(f"Error: {e}")
