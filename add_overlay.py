import sys

with open('C:\\NexusCut\\mobile\\app\\editor.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = """              {/* Simulated Player Transition Overlay */}
              {transitionOpacity > 0 && (
                <View 
                  pointerEvents="none\""""

if 'Overlay Text Engine' not in content:
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
                          {textSeg.text || 'Add Text'}
                        </Text>
                      </View>
                    ))
                  )}
                </View>
              )}

"""
    content = content.replace(target, overlay + target)
    with open('C:\\NexusCut\\mobile\\app\\editor.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print('Added Overlay Text Engine back!')
else:
    # If it is there, make sure it is using 'program' and xPosition
    old_overlay = "activePreviewMode === 'timeline'"
    new_overlay = "activePreviewMode === 'program'"
    content = content.replace(old_overlay, new_overlay)
    
    with open('C:\\NexusCut\\mobile\\app\\editor.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print('Updated Overlay Text Engine to use program mode!')
