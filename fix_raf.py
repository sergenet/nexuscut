import re

with open(r'C:\NexusCut\src\components\VideoEditor.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

raf_code = """
  // 60FPS polling for smooth captions
  useEffect(() => {
    let animationFrameId: number;
    const loop = () => {
      if (isPlaying && videoRef.current) {
        handleTimeUpdate();
        animationFrameId = requestAnimationFrame(loop);
      }
    };
    if (isPlaying) {
      animationFrameId = requestAnimationFrame(loop);
    }
    return () => cancelAnimationFrame(animationFrameId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, activeSegments]);
"""

# Insert it right before handleTimelineClick
content = content.replace('  const handleTimelineClick =', raf_code + '\n  const handleTimelineClick =')

with open(r'C:\NexusCut\src\components\VideoEditor.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
