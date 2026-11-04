import re

with open('C:\\NexusCut\\mobile\\app\\editor.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add imports and globals
import_target = "import { Ionicons } from '@expo/vector-icons';"
import_replacement = """import { Ionicons } from '@expo/vector-icons';
import { ImageSegmenter, FilesetResolver } from '@mediapipe/tasks-vision';

let globalSegmenter: any = null;
let isSegmenterInitializing = false;
const initMediaPipe = async () => {
  if (globalSegmenter || isSegmenterInitializing) return;
  isSegmenterInitializing = true;
  try {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
    );
    globalSegmenter = await ImageSegmenter.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite",
        delegate: "GPU"
      },
      runningMode: "VIDEO",
      outputCategoryMask: true,
      outputConfidenceMasks: false
    });
    console.log("MediaPipe SelfieSegmenter initialized successfully!");
  } catch (err) {
    console.error("Failed to initialize MediaPipe:", err);
  }
};"""

if import_target in content:
    content = content.replace(import_target, import_replacement, 1)
    print("Added imports")

# 2. Add aiCanvasRef
ref_target = "const webVideoRef = useRef<any>(null);"
ref_replacement = """const webVideoRef = useRef<any>(null);
  const aiCanvasRef = useRef<any>(null);"""

if ref_target in content:
    content = content.replace(ref_target, ref_replacement, 1)
    print("Added aiCanvasRef")

# 3. Add useEffect to init MediaPipe
init_target = """  useEffect(() => {
    // Add keyboard listeners for Undo/Redo"""
init_replacement = """  useEffect(() => {
    if (Platform.OS === 'web') {
      initMediaPipe();
    }
  }, []);

  useEffect(() => {
    // Add keyboard listeners for Undo/Redo"""

if init_target in content:
    content = content.replace(init_target, init_replacement, 1)
    print("Added initMediaPipe")

# 4. Add the Canvas to the JSX
video_target = """                Platform.OS === 'web' ? (
                  <video 
                    ref={webVideoRef}
                    src={activeMedia}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    autoPlay={isPlaying}
                    controls={false}
                  />
                )"""
video_replacement = """                Platform.OS === 'web' ? (
                  <>
                    <video 
                      ref={webVideoRef}
                      src={activeMedia}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      autoPlay={isPlaying}
                      controls={false}
                    />
                    <canvas 
                      ref={aiCanvasRef}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none', display: 'none' }}
                    />
                  </>
                )"""

if video_target in content:
    content = content.replace(video_target, video_replacement, 1)
    print("Added canvas")
else:
    print("Failed to find video target!")


# 5. Add AI logic to loop
loop_target = """        if (state.isPlaying) {
          let newTime = state.currentTime + dt;"""
loop_replacement = """        // AI Background Removal Logic
        if (Platform.OS === 'web' && webVideoRef.current && aiCanvasRef.current) {
          const v = webVideoRef.current;
          const cvs = aiCanvasRef.current;
          const isAiEnabled = currentSeg?.aiEffects?.removeBackground;
          
          if (isAiEnabled && globalSegmenter && v.readyState >= 2) {
             v.style.opacity = '0';
             cvs.style.display = 'block';
             
             if (v.dataset.lastProcessedTime !== String(v.currentTime)) {
                v.dataset.lastProcessedTime = String(v.currentTime);
                try {
                  globalSegmenter.segmentForVideo(v, performance.now(), (result: any) => {
                    const ctx = cvs.getContext('2d', { willReadFrequently: true });
                    if (ctx && result.categoryMask) {
                      const mWidth = result.categoryMask.width;
                      const mHeight = result.categoryMask.height;
                      cvs.width = mWidth;
                      cvs.height = mHeight;
                      const mask = result.categoryMask.getAsUint8Array();
                      const imgData = ctx.createImageData(mWidth, mHeight);
                      for (let i = 0; i < mask.length; i++) {
                         imgData.data[i * 4 + 0] = 0;
                         imgData.data[i * 4 + 1] = 0;
                         imgData.data[i * 4 + 2] = 0;
                         imgData.data[i * 4 + 3] = mask[i] > 0 ? 255 : 0;
                      }
                      ctx.putImageData(imgData, 0, 0);
                      ctx.globalCompositeOperation = 'source-in';
                      ctx.drawImage(v, 0, 0, mWidth, mHeight);
                      ctx.globalCompositeOperation = 'source-over';
                    }
                  });
                } catch(e) {}
             }
          } else {
             v.style.opacity = '1';
             cvs.style.display = 'none';
          }
        }

        if (state.isPlaying) {
          let newTime = state.currentTime + dt;"""

if loop_target in content:
    content = content.replace(loop_target, loop_replacement, 1)
    print("Added loop logic")
else:
    print("Failed to find loop target!")


# 6. Add UI to inspector
inspector_target = """                        </View>
                      </View>
                  )}
                </ScrollView>
              ) : ("""

inspector_replacement = """                        </View>
                      </View>
                  )}

                  {(selectedSegment.type === 'video' || selectedSegment.type === 'image') && (
                    <View style={styles.inspectorItem}>
                      <View style={styles.inspectorHeader}>
                        <Ionicons name="sparkles" size={18} color="#38bdf8" />
                        <Text style={styles.inspectorTitle}>AI Tools</Text>
                      </View>
                      <Text style={styles.inspectorDesc}>Enhance this clip using local in-browser machine learning.</Text>
                      
                      <TouchableOpacity 
                        style={[styles.inspectorToggle, selectedSegment.aiEffects?.removeBackground && { backgroundColor: '#38bdf8' }]}
                        onPress={() => {
                          const currentVal = selectedSegment.aiEffects?.removeBackground;
                          updateSegment(selectedSegment.trackId, selectedSegment.id, {
                            aiEffects: { ...selectedSegment.aiEffects, removeBackground: !currentVal }
                          });
                        }}
                      >
                        <Text style={[styles.inspectorToggleText, selectedSegment.aiEffects?.removeBackground && { color: '#000' }]}>
                          {selectedSegment.aiEffects?.removeBackground ? 'Background Removed' : 'Remove Background'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </ScrollView>
              ) : ("""

if inspector_target in content:
    content = content.replace(inspector_target, inspector_replacement, 1)
    print("Added inspector UI")
else:
    print("Failed to find inspector target!")


with open('C:\\NexusCut\\mobile\\app\\editor.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
