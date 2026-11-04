import re

with open('C:\\NexusCut\\mobile\\app\\editor.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

overlay = """
              {/* Overlay Text Engine */}
              {activePreviewMode === 'program' && (
                <View style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]} pointerEvents="none">
                  {tracks.map(track => 
                    track.segments.filter(s => s.type === 'text' && currentTime >= s.start && currentTime <= s.end).map(textSeg => (
                      <View 
                        key={textSeg.id} 
                        style={{
                          position: 'absolute',
                          width: '100%',
                          top: `${textSeg.yPosition ?? 50}%`,
                          left: `${(textSeg.xPosition ?? 50) - 50}%`,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text style={{
                          color: textSeg.color || '#fff',
                          fontSize: textSeg.fontSize || 32,
                          fontWeight: 'bold',
                          textAlign: 'center',
                          textShadowColor: 'rgba(0,0,0,0.8)',
                          textShadowOffset: { width: 1, height: 1 },
                          textShadowRadius: 4,
                        }}>
                          {textSeg.text || ''}
                        </Text>
                      </View>
                    ))
                  )}
                </View>
              )}
"""

if 'Overlay Text Engine' not in content:
    content = re.sub(r'(\{\/\*\s*Simulated Player Transition Overlay\s*\*\/})', overlay + r'\1', content)
    with open('C:\\NexusCut\\mobile\\app\\editor.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print('Added correctly this time!')
else:
    print('Already exists!')
