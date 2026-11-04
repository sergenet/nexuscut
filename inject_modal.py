import sys

with open('C:\\NexusCut\\mobile\\app\\editor.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

modal = """
          {/* Quick Text Editor Floating Panel */}
          {selectedSegmentId && selectedSegment?.type === 'text' && (
            <View style={{
              position: 'absolute',
              bottom: 80,
              left: '10%',
              right: '10%',
              backgroundColor: 'rgba(24, 24, 27, 0.95)',
              padding: 16,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#3f3f46',
              zIndex: 9999,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.5,
              shadowRadius: 10,
              elevation: 10
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ color: '#e4e4e7', fontSize: 16, fontWeight: '700' }}>Edit Text</Text>
                <TouchableOpacity onPress={() => useEditorStore.getState().selectSegment(null)}>
                  <Ionicons name="close" size={20} color="#a1a1aa" />
                </TouchableOpacity>
              </View>
              
              <TextInput 
                style={{ backgroundColor: '#09090b', color: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#52525b', marginBottom: 16 }}
                value={selectedSegment.text || ''}
                onChangeText={(t) => updateSegment(selectedSegment.trackId, selectedSegment.id, { text: t })}
                placeholder="Enter text..."
                placeholderTextColor="#71717a"
              />
              
              <Text style={{ color: '#e4e4e7', fontSize: 14, fontWeight: '600', marginBottom: 8 }}>Vertical Position ({selectedSegment.yPosition ?? 50}%)</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <WebSlider 
                  min={0} max={100} 
                  value={selectedSegment.yPosition ?? 50} 
                  onChange={(v) => updateSegment(selectedSegment.trackId, selectedSegment.id, { yPosition: v })} 
                />
              </View>
            </View>
          )}
"""

target = "{/* Page 3: Right Pane: Inspector */}"
if target in content:
    # Insert modal before the target
    parts = content.split(target)
    # the previous part should end with </View>\n\n
    new_content = parts[0] + modal + "\n        " + target + parts[1]
    with open('C:\\NexusCut\\mobile\\app\\editor.tsx', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Modal inserted successfully")
else:
    print("Target not found")
