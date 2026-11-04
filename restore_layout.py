import re

file_path = r"C:\NexusCut\mobile\app\editor.tsx"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# The unified layout will use the isMobile block's inner contents, but modified.
# The layout starts at `      {/* Main Content Area */}`

start_marker = "      {/* Main Content Area */}"
end_marker = "      {/* Bottom Timeline Area */}"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx == -1 or end_idx == -1:
    print("Could not find layout blocks")
    exit(1)

# Extract everything inside the isMobile block
is_mobile_start = content.find("<ScrollView", start_idx)
is_mobile_end = content.find("</ScrollView>", is_mobile_start) + len("</ScrollView>")

is_mobile_block = content[is_mobile_start:is_mobile_end]

# We need to replace the ScrollView props
old_scroll_props = """        <ScrollView 
          horizontal 
          pagingEnabled 
          showsHorizontalScrollIndicator={false}
          style={styles.mainContent}
          contentContainerStyle={{ flexGrow: 1, flexDirection: 'row', width: windowWidth * 3 }}
        >"""

new_scroll_props = """        <ScrollView 
          horizontal 
          scrollEnabled={isMobile}
          pagingEnabled={isMobile}
          showsHorizontalScrollIndicator={false}
          style={[styles.mainContent, { width: '100%' }]}
          contentContainerStyle={{ 
            flexGrow: 1, 
            height: '100%', 
            flexDirection: 'row',
            width: isMobile ? windowWidth * 3 : '100%' 
          }}
        >"""

is_mobile_block = is_mobile_block.replace(old_scroll_props, new_scroll_props)

# Fix Page 1 container
page1_old = "<View style={{ width: windowWidth, flexDirection: 'row', height: '100%' }}>"
page1_new = "<View style={[{ flexDirection: 'row', height: '100%' }, isMobile ? { width: windowWidth } : { width: 370 }]}>"
is_mobile_block = is_mobile_block.replace(page1_old, page1_new)

# Fix NavRail container inside Page 1
navrail_old = "<View style={[styles.navRail, { width: 70 }]}>"
navrail_new = "<View style={[styles.navRail, isMobile && { width: 70 }]}>"
is_mobile_block = is_mobile_block.replace(navrail_old, navrail_new)

# Fix LeftPane container inside Page 1
leftpane_old = "<View style={[styles.leftPane, { width: windowWidth - 70 }]}>"
leftpane_new = "<View style={[styles.leftPane, isMobile && { width: windowWidth - 70 }]}>"
is_mobile_block = is_mobile_block.replace(leftpane_old, leftpane_new)

# Fix Page 2 container
page2_old = "<View style={[styles.preview, { width: windowWidth }]}>"
page2_new = "<View style={[styles.preview, isMobile ? { width: windowWidth } : { flex: 1 }]}>"
is_mobile_block = is_mobile_block.replace(page2_old, page2_new)

# Fix Page 3 container
page3_old = "<View style={[styles.rightPane, { width: windowWidth }]}>"
page3_new = "<View style={[styles.rightPane, isMobile ? { width: windowWidth } : { width: 280 }]}>"
is_mobile_block = is_mobile_block.replace(page3_old, page3_new)

# Replace the entire block in the file
new_content = content[:start_idx] + start_marker + "\n" + is_mobile_block + "\n      " + content[end_idx:]

# Ensure formatTime and setIsPlaying fixes are preserved inside the isMobile block
# (Because the user complained about the layout, the isMobile block might still have the formatTime error)
# Wait, I fixed it in the DESKTOP block earlier, did I fix it in the MOBILE block?
# Let's fix it universally in the new_content just to be safe.
new_content = new_content.replace("{formatTime(currentTime)} / {formatTime(duration)}", "{formatTime(currentTime)} / {formatTime(videoDuration)}")
new_content = new_content.replace("onPress={togglePlayPause}", "onPress={() => setIsPlaying(!isPlaying)}")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Unified layout restored!")
