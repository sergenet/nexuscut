import cv2
import numpy as np
import os

overlay_dir = r"C:\NexusCut\scratch\hormozi_suite\Graphic_Overlays"
os.makedirs(overlay_dir, exist_ok=True)

# Helper to create transparent canvas
def create_bgra(w, h):
    return np.zeros((h, w, 4), dtype=np.uint8)

# 1. Badge: STOP SCROLLING
img = create_bgra(800, 220)
# Draw angled black background rectangle with thick yellow border
pts = np.array([[30, 20], [770, 35], [740, 195], [60, 180]], np.int32)
cv2.fillPoly(img, [pts], (0, 0, 0, 255))
cv2.polylines(img, [pts], True, (0, 220, 255, 255), 10, cv2.LINE_AA) # Yellow BGR: 0, 220, 255
# Text
cv2.putText(img, "STOP SCROLLING", (85, 130), cv2.FONT_HERSHEY_DUPLEX, 2.1, (0, 220, 255, 255), 8, cv2.LINE_AA)
cv2.putText(img, "STOP SCROLLING", (85, 130), cv2.FONT_HERSHEY_DUPLEX, 2.1, (255, 255, 255, 255), 3, cv2.LINE_AA)
cv2.imwrite(os.path.join(overlay_dir, "01_badge_stop_scrolling.png"), img)

# 2. Badge: PRO TIP
img = create_bgra(600, 180)
# Rounded yellow pill
cv2.rectangle(img, (60, 25), (540, 155), (0, 0, 0, 255), -1) # Shadow
cv2.rectangle(img, (50, 15), (530, 145), (0, 225, 255, 255), -1)
cv2.rectangle(img, (50, 15), (530, 145), (0, 0, 0, 255), 6)
cv2.putText(img, "PRO TIP", (145, 105), cv2.FONT_HERSHEY_DUPLEX, 2.4, (0, 0, 0, 255), 8, cv2.LINE_AA)
cv2.imwrite(os.path.join(overlay_dir, "02_badge_pro_tip.png"), img)

# 3. Badge: WARNING
img = create_bgra(650, 200)
pts = np.array([[40, 20], [610, 20], [590, 180], [20, 180]], np.int32)
cv2.fillPoly(img, [pts], (0, 220, 255, 255))
cv2.polylines(img, [pts], True, (0, 0, 0, 255), 8, cv2.LINE_AA)
# Hazard stripes on left & right
cv2.line(img, (60, 20), (30, 180), (0, 0, 0, 255), 14)
cv2.line(img, (100, 20), (70, 180), (0, 0, 0, 255), 14)
cv2.line(img, (550, 20), (520, 180), (0, 0, 0, 255), 14)
cv2.line(img, (590, 20), (560, 180), (0, 0, 0, 255), 14)
cv2.putText(img, "WARNING", (150, 125), cv2.FONT_HERSHEY_DUPLEX, 2.3, (0, 0, 0, 255), 8, cv2.LINE_AA)
cv2.imwrite(os.path.join(overlay_dir, "03_badge_warning.png"), img)

# 4. Badge: SECRET REVEALED
img = create_bgra(750, 190)
cv2.rectangle(img, (25, 20), (725, 170), (0, 0, 0, 255), -1)
cv2.rectangle(img, (25, 20), (725, 170), (0, 220, 255, 255), 6)
cv2.putText(img, "SECRET REVEALED", (60, 120), cv2.FONT_HERSHEY_DUPLEX, 2.0, (0, 220, 255, 255), 7, cv2.LINE_AA)
cv2.imwrite(os.path.join(overlay_dir, "04_badge_secret_revealed.png"), img)

# 5. Badge: 100%
img = create_bgra(350, 350)
cv2.circle(img, (175, 175), 150, (0, 0, 0, 255), -1)
cv2.circle(img, (175, 175), 140, (0, 225, 255, 255), -1)
cv2.circle(img, (175, 175), 140, (0, 0, 0, 255), 8)
cv2.putText(img, "100%", (55, 205), cv2.FONT_HERSHEY_DUPLEX, 2.6, (0, 0, 0, 255), 9, cv2.LINE_AA)
cv2.imwrite(os.path.join(overlay_dir, "05_badge_100_percent.png"), img)

# 6. Badge: KEY TAKEAWAY
img = create_bgra(720, 180)
cv2.rectangle(img, (30, 25), (690, 155), (0, 220, 255, 255), -1)
cv2.rectangle(img, (30, 25), (690, 155), (0, 0, 0, 255), 6)
cv2.putText(img, "KEY TAKEAWAY", (65, 115), cv2.FONT_HERSHEY_DUPLEX, 2.0, (0, 0, 0, 255), 7, cv2.LINE_AA)
cv2.imwrite(os.path.join(overlay_dir, "06_badge_key_takeaway.png"), img)

# 7. Graphic: Bold Yellow Down Arrow
img = create_bgra(260, 380)
arrow_pts = np.array([
    [90, 30], [170, 30], [170, 200], [235, 200], [130, 350], [25, 200], [90, 200]
], np.int32)
cv2.fillPoly(img, [arrow_pts], (0, 225, 255, 255))
cv2.polylines(img, [arrow_pts], True, (0, 0, 0, 255), 10, cv2.LINE_AA)
cv2.imwrite(os.path.join(overlay_dir, "07_arrow_down_bold.png"), img)

# 8. Graphic: Yellow Highlighter Underline Stroke
img = create_bgra(700, 100)
# Dynamic organic brush stroke
for x in range(30, 670, 3):
    y_center = 50 + int(np.sin(x * 0.015) * 8)
    thickness = int(22 + np.sin(x * 0.02) * 6)
    cv2.circle(img, (x, y_center), thickness // 2, (0, 220, 255, 230), -1)
cv2.imwrite(os.path.join(overlay_dir, "08_highlighter_underline.png"), img)

print("Graphic callout overlays generated!")
