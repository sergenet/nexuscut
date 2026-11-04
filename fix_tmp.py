import re

with open(r'C:\NexusCut\src\app\api\transcribe\route.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("import fs from 'fs';", "import fs from 'fs';\nimport os from 'os';")
content = content.replace("const tempDir = path.join(process.cwd(), 'public', 'temp');", "const tempDir = os.tmpdir();")

with open(r'C:\NexusCut\src\app\api\transcribe\route.ts', 'w', encoding='utf-8') as f:
    f.write(content)

with open(r'C:\NexusCut\src\app\api\export\route.ts', 'r', encoding='utf-8') as f:
    export_content = f.read()

export_content = export_content.replace("import fs from 'fs';", "import fs from 'fs';\nimport os from 'os';")
export_content = export_content.replace("const tempDir = path.join(process.cwd(), 'public', 'temp');", "const tempDir = os.tmpdir();")

with open(r'C:\NexusCut\src\app\api\export\route.ts', 'w', encoding='utf-8') as f:
    f.write(export_content)
