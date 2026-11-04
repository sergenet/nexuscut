import sys
import re

with open('C:\\NexusCut\\mobile\\app\\editor.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the opening tag: it is currently:
# {isMobile ? ( <ScrollView ... > ) : ( <View ...> )}
# Let's replace it with a simple <View> wrapper.

pattern_start = re.compile(
    r'\{\/\* Main Content Area \*\/.*?\{isMobile \? \(\s*<ScrollView.*?>\s*\) : \(\s*<View.*?>\s*\)\}',
    re.DOTALL
)

replacement_start = """{/* Main Content Area */}
      <View style={[styles.mainContent, { flexDirection: 'row', width: '100%', overflow: 'hidden' }]}>"""

content = pattern_start.sub(replacement_start, content)

# Fix the closing tag
content = content.replace('</ScrollView>\n      {/* Bottom Timeline Area */}', '</View>\n      {/* Bottom Timeline Area */}')

with open('C:\\NexusCut\\mobile\\app\\editor.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Replaced wrapper with View!")
