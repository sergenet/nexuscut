import sys
import re

with open('C:\\NexusCut\\mobile\\app\\editor.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove the Floating Modal
modal_start = "{/* Quick Text Editor Floating Panel */}"
modal_end = "          {/* Page 3: Right Pane: Inspector */}"

if modal_start in content:
    content = content[:content.find(modal_start)] + modal_end + content[content.find(modal_end) + len(modal_end):]

# 2. Modify Right Pane to show 3 boxes for Text if activeTab == 'text'
right_pane_target = """            <View style={styles.inspectorContent}>
              {selectedSegmentId && selectedSegment ? ("""

right_pane_replacement = """            <View style={styles.inspectorContent}>
              {activeTab === 'text' ? (
                <ScrollView contentContainerStyle={{ paddingBottom: 40, gap: 24 }}>
                  {[
                    { id: 'Headline', label: 'Headline', defaultY: 50, size: 48 },
                    { id: 'Subtitle', label: 'Subtitle', defaultY: 80, size: 32 },
                    { id: 'Body Text', label: 'Body Text', defaultY: 90, size: 24 }
                  ].map(preset => {
                    // Find if there is a segment of this type at current time, or just the first one of this name
                    const seg = allSegments.find(s => s.type === 'text' && s.text === preset.id) || 
                                allSegments.find(s => s.type === 'text' && s.fontSize === preset.size);
                    
                    const handleTextChange = (t) => {
                      if (seg) {
                        updateSegment(seg.trackId, seg.id, { text: t });
                      } else {
                        // Create it if they type and it doesn't exist
                        const trackId = 'text-1';
                        useEditorStore.getState().addSegment(trackId, {
                          id: uuidv4(),
                          trackId: trackId,
                          start: 0,
                          end: 5,
                          duration: 5,
                          type: 'text',
                          src: '',
                          text: t,
                          fontSize: preset.size,
                          color: '#ffffff',
                          yPosition: preset.defaultY
                        });
                      }
                    };

                    const handlePosChange = (v) => {
                      if (seg) updateSegment(seg.trackId, seg.id, { yPosition: v });
                    };

                    return (
                      <View key={preset.id} style={{ backgroundColor: '#18181b', padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#3f3f46' }}>
                        <Text style={{ color: '#e4e4e7', fontSize: 14, fontWeight: '700', marginBottom: 12 }}>{preset.label}</Text>
                        
                        <TextInput 
                          style={{ backgroundColor: '#09090b', color: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#52525b', marginBottom: 16 }}
                          value={seg ? seg.text : ''}
                          onChangeText={handleTextChange}
                          placeholder={`Enter ${preset.label.toLowerCase()}...`}
                          placeholderTextColor="#71717a"
                          multiline
                        />
                        
                        <Text style={{ color: '#a1a1aa', fontSize: 12, fontWeight: '600', marginBottom: 8 }}>Vertical Position</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <WebSlider 
                            min={0} max={100} 
                            value={seg?.yPosition ?? preset.defaultY} 
                            onChange={handlePosChange} 
                          />
                        </View>
                      </View>
                    );
                  })}
                </ScrollView>
              ) : selectedSegmentId && selectedSegment ? ("""

if right_pane_target in content:
    content = content.replace(right_pane_target, right_pane_replacement)
else:
    print("Right pane target not found")

with open('C:\\NexusCut\\mobile\\app\\editor.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Modifications done")
