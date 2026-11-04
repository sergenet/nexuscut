import sys

with open('C:\\NexusCut\\mobile\\app\\editor.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

bad_start = """      {/* Main Content Area: Now a horizontal ScrollView for mobile swiping */}
      <View style={styles.container}>
        <TopNav />
        
        {/* Main Editor Area (Panes) */}
        {isMobile ? (
        <ScrollView 
          ref={scrollViewRef}
          horizontal={true}
          pagingEnabled={true}
          showsHorizontalScrollIndicator={false}
          style={[styles.mainContent]}
          contentContainerStyle={{ flexGrow: 1, height: '100%', flexDirection: 'row' }}
        >
        ) : (
        <View style={{ flex: 1, flexDirection: 'row', width: '100%', overflow: 'hidden' }}>
        )}"""

good_start = """      {/* Main Content Area */}
      <View style={styles.container}>
        <TopNav />
        
        {/* Main Editor Area (Panes) */}
        <View style={{ flex: 1, flexDirection: 'row', width: '100%', overflow: 'hidden' }}>"""

bad_end = """        {isMobile ? </ScrollView> : </View>}

        {/* Timeline Area (Bottom) */}"""

good_end = """        </View>

        {/* Timeline Area (Bottom) */}"""

content = content.replace(bad_start, good_start)
content = content.replace(bad_end, good_end)

# Also fix the Center Pane width which I think was left as `isMobile ? { width: windowWidth, ... } : { flex: 1, ... }`
# That's fine, flex: 1 on desktop is correct.

with open('C:\\NexusCut\\mobile\\app\\editor.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed illegal JSX")
