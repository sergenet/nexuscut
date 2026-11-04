import re

with open('C:\\NexusCut\\mobile\\app\\editor.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add marginBottom to DraggableLibraryItem wrapper
wrapper_target = "<View {...panResponder.panHandlers} style={{ touchAction: 'none' }}>"
wrapper_replacement = "<View {...panResponder.panHandlers} style={{ touchAction: 'none', marginBottom: 12 }}>"

if wrapper_target in content:
    content = content.replace(wrapper_target, wrapper_replacement)
    print("Fixed wrapper margin!")
else:
    print("Failed to find wrapper target!")

# 2. Reduce height of libraryItemThumb
thumb_target = """    libraryItemThumb: {
      height: 70,
      backgroundColor: '#27272a',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },"""

thumb_replacement = """    libraryItemThumb: {
      height: 48,
      backgroundColor: '#27272a',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },"""

if thumb_target in content:
    content = content.replace(thumb_target, thumb_replacement)
    print("Fixed thumb height!")
else:
    print("Failed to find thumb target!")

with open('C:\\NexusCut\\mobile\\app\\editor.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
