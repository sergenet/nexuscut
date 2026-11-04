import re

with open('C:\\NexusCut\\mobile\\app\\editor.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update Left Pane Text Presets to actually ADD the segment when clicked
left_pane_target = """              {activeTab === 'text' && (
                <ScrollView style={styles.libraryContainer}>
                  {[
                    { id: 'preset_headline', type: 'text' as any, uri: '', name: 'Headline', duration: 5 },
                    { id: 'preset_subtitle', type: 'text' as any, uri: '', name: 'Subtitle', duration: 5 },
                    { id: 'preset_body', type: 'text' as any, uri: '', name: 'Body Text', duration: 5 }
                  ].map(item => (
                    <DraggableLibraryItem 
                      key={item.id} 
                      item={item} 
                      isActive={false}
                      onPress={() => {}}"""

left_pane_replacement = """              {activeTab === 'text' && (
                <ScrollView style={styles.libraryContainer}>
                  <Text style={{ color: '#a1a1aa', fontSize: 12, marginBottom: 16, paddingHorizontal: 16 }}>Click to add text at the playhead.</Text>
                  {[
                    { id: 'preset_headline', type: 'text' as any, uri: '', name: 'Headline', duration: 5 },
                    { id: 'preset_subtitle', type: 'text' as any, uri: '', name: 'Subtitle', duration: 5 },
                    { id: 'preset_body', type: 'text' as any, uri: '', name: 'Body Text', duration: 5 }
                  ].map(item => (
                    <DraggableLibraryItem 
                      key={item.id} 
                      item={item} 
                      isActive={false}
                      onPress={() => {
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

if left_pane_target in content:
    content = content.replace(left_pane_target, left_pane_replacement)
    print('Left pane replaced!')
else:
    print('Left pane not found!')

# 2. Update Right Pane to be an Inspector for Text
right_pane_start = """            <View style={styles.paneHeader}>
              <Text style={styles.paneTitle}>{activeTab === 'text' ? 'Text Editor' : (selectedSegmentId ? 'Inspector' : 'Details')}</Text>
            </View>
            <View style={styles.inspectorContent}>
              {activeTab === 'text' ? ("""

pattern = re.compile(re.escape(right_pane_start) + r'.*?\) : selectedSegmentId \? \(', re.DOTALL)

right_pane_replacement = """            <View style={styles.paneHeader}>
              <Text style={styles.paneTitle}>{selectedSegmentId ? 'Inspector' : 'Details'}</Text>
            </View>
            <View style={styles.inspectorContent}>
              {selectedSegmentId && selectedSegment ? (
                <ScrollView contentContainerStyle={{ paddingBottom: 40, gap: 24 }}>
                  
                  {selectedSegment.type === 'text' && (
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
                  )}
                  
                  {selectedSegment.type !== 'text' && (
                    <Text style={styles.emptyStateSubtext}>No properties available for {selectedSegment.type} clip.</Text>
                  )}
                </ScrollView>
              ) : ("""

match = pattern.search(content)
if match:
    content = content[:match.start()] + right_pane_replacement + content[match.end():]
    print('Right pane replaced!')
else:
    print('Right pane not found!')

with open('C:\\NexusCut\\mobile\\app\\editor.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
