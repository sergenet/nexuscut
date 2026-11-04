import re

with open('C:\\NexusCut\\mobile\\app\\editor.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Prepend globals
globals_text = """import { ImageSegmenter, FilesetResolver } from '@mediapipe/tasks-vision';

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
};
"""

import_anchor = "import { Ionicons } from '@expo/vector-icons';"
if import_anchor in content:
    content = content.replace(import_anchor, import_anchor + "\n" + globals_text, 1)
    print("Added globals")

# 2. Add initMediaPipe to useEffect
use_effect_target = """  useEffect(() => {
    // Add keyboard listeners for Undo/Redo"""
use_effect_replacement = """  useEffect(() => {
    if (Platform.OS === 'web') {
      initMediaPipe();
    }
  }, []);

  useEffect(() => {
    // Add keyboard listeners for Undo/Redo"""

if use_effect_target in content:
    content = content.replace(use_effect_target, use_effect_replacement, 1)
    print("Added init to useEffect")

with open('C:\\NexusCut\\mobile\\app\\editor.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
