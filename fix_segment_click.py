import re

with open('C:\\NexusCut\\mobile\\components\\Timeline\\SegmentItem.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = """        onPanResponderRelease: (evt, gestureState) => {
          const s = segmentRef.current;
          const z = zoomRef.current;
          const currentLeft = s.start * z;
          const finalX = Math.max(0, currentLeft + gestureState.dx);"""

replacement = """        onPanResponderRelease: (evt, gestureState) => {
          const s = segmentRef.current;
          
          if (Math.abs(gestureState.dx) < 5 && Math.abs(gestureState.dy) < 5) {
            useEditorStore.getState().selectSegment(s.id);
            useEditorStore.getState().setActivePreviewMode('program');
            return;
          }
          
          const z = zoomRef.current;
          const currentLeft = s.start * z;
          const finalX = Math.max(0, currentLeft + gestureState.dx);"""

if target in content:
    content = content.replace(target, replacement, 1)
    print("Fixed click handler")
else:
    print("Target not found")

with open('C:\\NexusCut\\mobile\\components\\Timeline\\SegmentItem.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
