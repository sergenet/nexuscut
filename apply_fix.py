import sys
import re

with open('C:\\NexusCut\\mobile\\app\\editor.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the opening ScrollView with a conditional View for desktop
pattern_start = re.compile(
    r'\{\/\* Main Content Area: Now a horizontal ScrollView for mobile swiping \*\/\}.*?contentContainerStyle=\{\{ flexGrow: 1, height: \'100%\', flexDirection: \'row\' \}\}\s*>', 
    re.DOTALL
)

replacement_start = """{/* Main Content Area */}
      {isMobile ? (
        <ScrollView 
          horizontal 
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={[styles.mainContent]}
          contentContainerStyle={{ flexGrow: 1, height: '100%', flexDirection: 'row' }}
        >
      ) : (
        <View style={[styles.mainContent, { flexDirection: 'row', width: '100%', overflow: 'hidden' }]}>
      )}"""

# Replace the closing ScrollView
pattern_end = re.compile(r'</ScrollView>\s*\{\/\* Timeline Area \(Bottom\) \*\/\}', re.DOTALL)
replacement_end = """{isMobile ? </ScrollView> : </View>}
        {/* Timeline Area (Bottom) */}"""

if pattern_start.search(content):
    content = pattern_start.sub(replacement_start, content)
    content = pattern_end.sub(replacement_end, content)
    print("Replaced outer ScrollView logic!")
else:
    print("Target ScrollView not found!")

# Now make sure Right Pane Text Editor is in place!
right_pane_target = """        {/* Page 3: Right Pane: Inspector */}
        <View style={[styles.rightPane, isMobile ? { width: windowWidth, flexShrink: 0, height: '100%' } : { width: 300, flexShrink: 0, height: '100%' }]}>
          <View style={styles.paneHeader}>
            <Text style={styles.paneTitle}>{selectedSegmentId ? 'Inspector' : 'Details'}</Text>
          </View>
          <View style={styles.inspectorContent}>
            {selectedSegmentId ? ("""

if right_pane_target in content:
    right_pane_replacement = """        {/* Page 3: Right Pane: Inspector */}
        <View style={[styles.rightPane, isMobile ? { width: windowWidth, flexShrink: 0, height: '100%' } : { width: 300, flexShrink: 0, height: '100%' }]}>
          <View style={styles.paneHeader}>
            <Text style={styles.paneTitle}>{activeTab === 'text' ? 'Text Editor' : (selectedSegmentId ? 'Inspector' : 'Details')}</Text>
          </View>
          <View style={styles.inspectorContent}>
            {activeTab === 'text' ? (
              <ScrollView contentContainerStyle={{ paddingBottom: 40, gap: 24 }}>
                <Text style={{ color: '#a1a1aa', fontSize: 14, textAlign: 'center', marginBottom: 8 }}>
                  Type your text below to automatically add it to the video.
                </Text>
                {[
                  { id: 'Headline', label: 'Headline', defaultY: 50, size: 48 },
                  { id: 'Subtitle', label: 'Subtitle', defaultY: 80, size: 32 },
                  { id: 'Body Text', label: 'Body Text', defaultY: 90, size: 24 }
                ].map(preset => {
                  const seg = allSegments.find(s => s.type === 'text' && s.text === preset.id) || 
                              allSegments.find(s => s.type === 'text' && s.fontSize === preset.size);
                  
                  const handleTextChange = (t) => {
                    if (seg) {
                      updateSegment(seg.trackId, seg.id, { text: t });
                    } else {
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
                      
                      <Text style={{ color: '#a1a1aa', fontSize: 12, fontWeight: '600', marginBottom: 8 }}>Vertical Position ({seg?.yPosition ?? preset.defaultY}%)</Text>
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
            ) : selectedSegmentId ? ("""
    content = content.replace(right_pane_target, right_pane_replacement)
    print("Replaced Right Pane logic!")
else:
    print("Target Right Pane not found!")

# Add handleAddPresetToTimeline
drag_move_target = """  const handleDragMove = (x: number, y: number) => {
    if (!isNativeDrag) setDragPos({ x, y });
  };"""

add_preset_code = """
  const handleAddPresetToTimeline = (item: MediaItem) => {
    const state = useEditorStore.getState();
    const trackId = item.type === 'video' ? 'video-1' : item.type === 'audio' ? 'audio-1' : item.type === 'text' ? 'text-1' : 'video-1';
    const newId = uuidv4();
    let dropTime = state.currentTime;
    
    if (item.type === 'effect' && item.id.startsWith('trans_')) {
      alert("Please drag transitions directly onto a video clip in the timeline.");
      return;
    }
    
    state.addSegment(trackId, {
      id: newId,
      trackId: trackId,
      start: dropTime,
      end: dropTime + item.duration,
      duration: item.duration,
      type: item.type as any,
      src: item.uri,
      text: item.type === 'text' ? item.name : undefined,
      fontSize: item.type === 'text' ? (item.name === 'Headline' ? 48 : item.name === 'Subtitle' ? 32 : 24) : undefined,
      color: '#ffffff',
      yPosition: item.type === 'text' ? (item.name === 'Subtitle' ? 80 : 50) : undefined,
    });
    state.selectSegment(newId);
    
    if (isMobile && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: windowWidth * 2, animated: true });
    }
  };
"""

if drag_move_target in content:
    content = content.replace(drag_move_target, drag_move_target + "\n" + add_preset_code)
    print("Added handleAddPresetToTimeline")

with open('C:\\NexusCut\\mobile\\app\\editor.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
