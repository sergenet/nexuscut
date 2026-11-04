import re

with open('C:\\NexusCut\\mobile\\app\\editor.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = """                      <Text style={{ color: '#a1a1aa', fontSize: 12, fontWeight: '600', marginBottom: 8 }}>Duration ({(seg?.duration ?? 5).toFixed(1)}s)</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <WebSlider 
                          min={1} max={30} 
                          value={seg?.duration ?? 5} 
                          onChange={(v) => { if (seg) updateSegment(seg.trackId, seg.id, { duration: v, end: seg.start + v }); }} 
                        />
                      </View>
                    </View>
                  );"""

replacement = """                      <Text style={{ color: '#a1a1aa', fontSize: 12, fontWeight: '600', marginBottom: 8 }}>Duration ({(seg?.duration ?? 5).toFixed(1)}s)</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                        <WebSlider 
                          min={1} max={30} 
                          value={seg?.duration ?? 5} 
                          onChange={(v) => { if (seg) updateSegment(seg.trackId, seg.id, { duration: v, end: seg.start + v }); }} 
                        />
                      </View>

                      <Text style={{ color: '#a1a1aa', fontSize: 12, fontWeight: '600', marginBottom: 8 }}>Font Size ({seg?.fontSize ?? preset.size}px)</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                        <WebSlider 
                          min={10} max={150} 
                          value={seg?.fontSize ?? preset.size} 
                          onChange={(v) => { if (seg) updateSegment(seg.trackId, seg.id, { fontSize: v }); }} 
                        />
                      </View>
                      
                      <Text style={{ color: '#a1a1aa', fontSize: 12, fontWeight: '600', marginBottom: 8 }}>Font Family</Text>
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        {['sans-serif', 'serif', 'monospace', 'Impact', 'Comic Sans MS'].map(font => (
                          <TouchableOpacity 
                            key={font}
                            onPress={() => { if (seg) updateSegment(seg.trackId, seg.id, { fontFamily: font }); }}
                            style={{ 
                              paddingVertical: 6, paddingHorizontal: 10, 
                              borderRadius: 4, borderWidth: 1, 
                              backgroundColor: (seg?.fontFamily === font || (!seg?.fontFamily && font === 'sans-serif')) ? 'rgba(6,182,212,0.2)' : '#18181b',
                              borderColor: (seg?.fontFamily === font || (!seg?.fontFamily && font === 'sans-serif')) ? '#06b6d4' : '#3f3f46'
                            }}>
                            <Text style={{ color: '#fff', fontSize: 12, fontFamily: font }}>{font.split('-')[0]}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>

                    </View>
                  );"""

if target in content:
    content = content.replace(target, replacement)
    
    # We also need to make sure the Overlay Text Engine actually uses the fontFamily!
    overlay_target = """                        <Text style={{
                          color: textSeg.color || '#fff',
                          fontSize: textSeg.fontSize || 32,
                          fontWeight: 'bold',
                          textAlign: 'center',"""
    
    overlay_replacement = """                        <Text style={{
                          color: textSeg.color || '#fff',
                          fontSize: textSeg.fontSize || 32,
                          fontFamily: textSeg.fontFamily || 'sans-serif',
                          fontWeight: 'bold',
                          textAlign: 'center',"""
                          
    content = content.replace(overlay_target, overlay_replacement)

    with open('C:\\NexusCut\\mobile\\app\\editor.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print('Added Font settings!')
else:
    print('Target not found!')
