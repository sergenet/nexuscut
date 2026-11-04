import re

with open('C:\\NexusCut\\mobile\\app\\editor.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

text_target = """                      onPress={() => {
                        const trackId = 'text-1';
                        const dropTime = useEditorStore.getState().currentTime;
                        const newId = uuidv4();
                        const isHeadline = item.name === 'Headline';
                        const isSubtitle = item.name === 'Subtitle';
                        useEditorStore.getState().addSegment(trackId, {
                          id: newId,
                          trackId: trackId,
                          start: dropTime,
                          end: dropTime + 5,
                          duration: 5,
                          type: 'text',
                          text: item.name,
                          fontSize: isHeadline ? 48 : isSubtitle ? 32 : 24,
                          yPosition: isHeadline ? 50 : isSubtitle ? 80 : 90,
                          xPosition: 50,
                          color: '#ffffff',
                          fontFamily: 'sans-serif'
                        });
                        useEditorStore.getState().selectSegment(newId);
                      }}"""

text_replacement = """                      onPress={() => {
                        const store = useEditorStore.getState();
                        const allSegments = store.tracks.flatMap(t => t.segments);
                        const presetId = item.name === 'Headline' ? 'text-preset-headline' : item.name === 'Subtitle' ? 'text-preset-subtitle' : 'text-preset-body';
                        const existingSeg = allSegments.find(s => s.id === presetId);
                        
                        if (existingSeg) {
                          store.selectSegment(presetId);
                        } else {
                          const trackId = 'text-1';
                          const dropTime = store.currentTime;
                          const isHeadline = item.name === 'Headline';
                          const isSubtitle = item.name === 'Subtitle';
                          store.addSegment(trackId, {
                            id: presetId,
                            trackId: trackId,
                            start: dropTime,
                            end: dropTime + 5,
                            duration: 5,
                            type: 'text',
                            text: item.name,
                            fontSize: isHeadline ? 48 : isSubtitle ? 32 : 24,
                            yPosition: isHeadline ? 50 : isSubtitle ? 80 : 90,
                            xPosition: 50,
                            color: '#ffffff',
                            fontFamily: 'sans-serif'
                          });
                          store.selectSegment(presetId);
                        }
                      }}"""

if text_target in content:
    content = content.replace(text_target, text_replacement)
    print('Fixed text presets!')
else:
    print('Failed to find text presets target!')

with open('C:\\NexusCut\\mobile\\app\\editor.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
