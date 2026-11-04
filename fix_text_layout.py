import re

with open('C:\\NexusCut\\mobile\\app\\editor.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update Right Pane width
rp_target = "<View style={[styles.rightPane, isMobile ? { width: windowWidth, flexShrink: 0, height: '100%' } : { width: 300, flexShrink: 0, height: '100%' }]}>"
rp_replacement = "<View style={[styles.rightPane, isMobile ? { width: windowWidth, flexShrink: 0, height: '100%' } : { width: (selectedSegmentId && selectedSegment?.type === 'text') ? 600 : 300, flexShrink: 0, height: '100%' }]}>"

if rp_target in content:
    content = content.replace(rp_target, rp_replacement)
    print('Expanded right pane width!')
else:
    print('Failed to expand right pane width')

# 2. Update Text Inspector layout to side-by-side
target_layout = """                  {selectedSegment.type === 'text' && (
                    <View style={{ backgroundColor: '#18181b', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#27272a' }}>
                      <Text style={{ color: '#a1a1aa', fontSize: 12, fontWeight: '600', marginBottom: 8 }}>Text Content</Text>
                      <TextInput 
                        style={[styles.textInput, { marginBottom: 16 }]}
                        value={selectedSegment.text || ''}
                        onChangeText={(t) => updateSegment(selectedSegment.trackId, selectedSegment.id, { text: t })}
                        placeholder="Enter text..."
                        placeholderTextColor="#52525b"
                        multiline
                      />

                      <Text style={{ color: '#a1a1aa', fontSize: 12, fontWeight: '600', marginBottom: 8 }}>Vertical Position ({selectedSegment.yPosition ?? 50}%)</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                        <WebSlider 
                          min={0} max={100} 
                          value={selectedSegment.yPosition ?? 50} 
                          onChange={(v) => updateSegment(selectedSegment.trackId, selectedSegment.id, { yPosition: v })} 
                        />
                      </View>
                      
                      <Text style={{ color: '#a1a1aa', fontSize: 12, fontWeight: '600', marginBottom: 8 }}>Horizontal Position ({selectedSegment.xPosition ?? 50}%)</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                        <WebSlider 
                          min={0} max={100} 
                          value={selectedSegment.xPosition ?? 50} 
                          onChange={(v) => updateSegment(selectedSegment.trackId, selectedSegment.id, { xPosition: v })} 
                        />
                      </View>

                      <Text style={{ color: '#a1a1aa', fontSize: 12, fontWeight: '600', marginBottom: 8 }}>Duration ({(selectedSegment.duration ?? 5).toFixed(1)}s)</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                        <WebSlider 
                          min={1} max={30} 
                          value={selectedSegment.duration ?? 5} 
                          onChange={(v) => updateSegment(selectedSegment.trackId, selectedSegment.id, { duration: v, end: selectedSegment.start + v })} 
                        />
                      </View>

                      <Text style={{ color: '#a1a1aa', fontSize: 12, fontWeight: '600', marginBottom: 8 }}>Font Size ({selectedSegment.fontSize ?? 32}px)</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                        <WebSlider 
                          min={10} max={150} 
                          value={selectedSegment.fontSize ?? 32} 
                          onChange={(v) => updateSegment(selectedSegment.trackId, selectedSegment.id, { fontSize: v })} 
                        />
                      </View>
                      
                      <Text style={{ color: '#a1a1aa', fontSize: 12, fontWeight: '600', marginBottom: 8 }}>Font Family</Text>
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        {['sans-serif', 'serif', 'monospace', 'Impact', 'Comic Sans MS'].map(font => (
                          <TouchableOpacity 
                            key={font}
                            onPress={() => updateSegment(selectedSegment.trackId, selectedSegment.id, { fontFamily: font })}
                            style={{ 
                              paddingVertical: 6, paddingHorizontal: 10, 
                              borderRadius: 4, borderWidth: 1, 
                              backgroundColor: (selectedSegment.fontFamily === font || (!selectedSegment.fontFamily && font === 'sans-serif')) ? 'rgba(6,182,212,0.2)' : '#18181b',
                              borderColor: (selectedSegment.fontFamily === font || (!selectedSegment.fontFamily && font === 'sans-serif')) ? '#06b6d4' : '#3f3f46'
                            }}>
                            <Text style={{ color: '#fff', fontSize: 12, fontFamily: font }}>{font.split('-')[0]}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )"""

replacement_layout = """                  {selectedSegment.type === 'text' && (
                    <View style={{ backgroundColor: '#18181b', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#27272a', flexDirection: isMobile ? 'column' : 'row', gap: 24 }}>
                      
                      {/* Left Column: Text Box */}
                      <View style={{ flex: 1, minHeight: 200 }}>
                        <Text style={{ color: '#a1a1aa', fontSize: 12, fontWeight: '600', marginBottom: 8 }}>Text Content</Text>
                        <TextInput 
                          style={{ flex: 1, backgroundColor: '#09090b', color: '#fff', padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#52525b', textAlignVertical: 'top', fontSize: 16 }}
                          value={selectedSegment.text || ''}
                          onChangeText={(t) => updateSegment(selectedSegment.trackId, selectedSegment.id, { text: t })}
                          placeholder="Enter text..."
                          placeholderTextColor="#52525b"
                          multiline
                        />
                      </View>

                      {/* Right Column: Controls */}
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: '#a1a1aa', fontSize: 12, fontWeight: '600', marginBottom: 8 }}>Vertical Position ({selectedSegment.yPosition ?? 50}%)</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                          <WebSlider 
                            min={0} max={100} 
                            value={selectedSegment.yPosition ?? 50} 
                            onChange={(v) => updateSegment(selectedSegment.trackId, selectedSegment.id, { yPosition: v })} 
                          />
                        </View>
                        
                        <Text style={{ color: '#a1a1aa', fontSize: 12, fontWeight: '600', marginBottom: 8 }}>Horizontal Position ({selectedSegment.xPosition ?? 50}%)</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                          <WebSlider 
                            min={0} max={100} 
                            value={selectedSegment.xPosition ?? 50} 
                            onChange={(v) => updateSegment(selectedSegment.trackId, selectedSegment.id, { xPosition: v })} 
                          />
                        </View>

                        <Text style={{ color: '#a1a1aa', fontSize: 12, fontWeight: '600', marginBottom: 8 }}>Duration ({(selectedSegment.duration ?? 5).toFixed(1)}s)</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                          <WebSlider 
                            min={1} max={30} 
                            value={selectedSegment.duration ?? 5} 
                            onChange={(v) => updateSegment(selectedSegment.trackId, selectedSegment.id, { duration: v, end: selectedSegment.start + v })} 
                          />
                        </View>

                        <Text style={{ color: '#a1a1aa', fontSize: 12, fontWeight: '600', marginBottom: 8 }}>Font Size ({selectedSegment.fontSize ?? 32}px)</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                          <WebSlider 
                            min={10} max={150} 
                            value={selectedSegment.fontSize ?? 32} 
                            onChange={(v) => updateSegment(selectedSegment.trackId, selectedSegment.id, { fontSize: v })} 
                          />
                        </View>
                        
                        <Text style={{ color: '#a1a1aa', fontSize: 12, fontWeight: '600', marginBottom: 8 }}>Font Family</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                          {['sans-serif', 'serif', 'monospace', 'Impact', 'Comic Sans MS'].map(font => (
                            <TouchableOpacity 
                              key={font}
                              onPress={() => updateSegment(selectedSegment.trackId, selectedSegment.id, { fontFamily: font })}
                              style={{ 
                                paddingVertical: 6, paddingHorizontal: 10, 
                                borderRadius: 4, borderWidth: 1, 
                                backgroundColor: (selectedSegment.fontFamily === font || (!selectedSegment.fontFamily && font === 'sans-serif')) ? 'rgba(6,182,212,0.2)' : '#18181b',
                                borderColor: (selectedSegment.fontFamily === font || (!selectedSegment.fontFamily && font === 'sans-serif')) ? '#06b6d4' : '#3f3f46'
                              }}>
                              <Text style={{ color: '#fff', fontSize: 12, fontFamily: font }}>{font.split('-')[0]}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    </View>
                  )"""

if target_layout in content:
    content = content.replace(target_layout, replacement_layout)
    print('Updated layout to side-by-side!')
else:
    print('Failed to find layout')

with open('C:\\NexusCut\\mobile\\app\\editor.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
