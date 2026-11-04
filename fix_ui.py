import sys
import re

with open(r'C:\NexusCut\src\components\VideoEditor.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# The backticks were stripped by PowerShell!
# 1. className={lex ...} -> className={`flex ...`}
content = content.replace("className={\x0clex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${activeStep === step.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'}",
                          "className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${activeStep === step.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'}`}")

# 2. className={w-6 ...} -> className={`w-6 ...`}
content = content.replace("className={w-6 h-6 rounded-full flex items-center justify-center text-xs ${activeStep === step.id ? 'bg-white text-indigo-600' : 'bg-neutral-800 text-neutral-400'}",
                          "className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${activeStep === step.id ? 'bg-white text-indigo-600' : 'bg-neutral-800 text-neutral-400'}`}")

# 3. left: ${(seg.start / videoDuration) * 100}%
# width: ${((seg.end - seg.start) / videoDuration) * 100}%
content = re.sub(r'style=\{\{\s*left:\s*\$\{\(seg\.start \/ videoDuration\) \* 100\}%,\s*width:\s*\$\{\(\(seg\.end - seg\.start\) \/ videoDuration\) \* 100\}%\s*\}\}',
                 r'style={{ left: `${(seg.start / videoDuration) * 100}%`, width: `${((seg.end - seg.start) / videoDuration) * 100}%` }}', content)

# 4. style={{ left: ${(currentTime / videoDuration) * 100}% }}
content = re.sub(r'style=\{\{\s*left:\s*\$\{\(currentTime \/ videoDuration\) \* 100\}%\s*\}\}',
                 r'style={{ left: `${(currentTime / videoDuration) * 100}%` }}', content)

# Just to be sure, check if there's any other style={{ left: ...}} missing backticks
content = content.replace('left: ${(currentTime', 'left: `${(currentTime')
content = content.replace(') * 100}% }', ') * 100}%` }')


with open(r'C:\NexusCut\src\components\VideoEditor.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
