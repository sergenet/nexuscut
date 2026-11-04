import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, PanResponder, Animated, Platform, Image, Alert } from 'react-native';
import { TrackSegment, useEditorStore } from '../../store/useEditorStore';
import { FrameExtractor } from '../../lib/FrameExtractor';

interface SegmentItemProps {
  segment: TrackSegment;
}

function Waveform({ segment, zoomLevel }: { segment: TrackSegment, zoomLevel: number }) {
  const getHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return Math.abs(hash);
  };
  
  const hash = getHash(segment.id + segment.src);
  // 5px per bar (3px width, 2px gap) makes them thicker and more premium
  const totalBars = Math.floor((segment.duration * zoomLevel) / 5);
  
  const bars = [];
  for (let i = 0; i < totalBars; i++) {
    // Generate much more dramatic peaks to look like real voice/music data
    const sine1 = Math.abs(Math.sin(i * 0.3 + hash));
    const sine2 = Math.abs(Math.cos(i * 0.1));
    const isPeak = (i % 7 === 0) || (i % 11 === 0);
    
    let val = (sine1 * 40) + (sine2 * 20);
    if (isPeak) val += 30 + (hash % 20); // Add dramatic spikes
    
    // Silence gaps randomly
    if ((i + hash) % 15 < 3) val = 5; 
    
    bars.push(Math.min(100, Math.max(5, val))); 
  }
  
  const isAudio = segment.type === 'audio';
  
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', height: isAudio ? '100%' : 16, backgroundColor: isAudio ? 'transparent' : '#0f172a', overflow: 'hidden', pointerEvents: 'none', borderTopWidth: isAudio ? 0 : 1, borderTopColor: 'rgba(255,255,255,0.05)' }}>
      {bars.map((height, i) => (
        <View key={i} style={{ width: 3, height: `${height}%`, backgroundColor: isAudio ? '#10b981' : '#38bdf8', marginLeft: 2, borderRadius: 2 }} />
      ))}
    </View>
  );
}

export default function SegmentItem({ segment }: SegmentItemProps) {
  const { zoomLevel, selectedSegmentId, selectSegment, updateSegment, setActivePreviewMode } = useEditorStore();
  const [frames, setFrames] = useState<string[]>([]);
  
  // Convert time to pixels
  const baseWidth = segment.duration * zoomLevel;
  const baseLeft = segment.start * zoomLevel;
  
  const isSelected = selectedSegmentId === segment.id;

  // Use Animated.Value for blazing fast 60fps rendering without React reconciliation
  const pan = useRef(new Animated.ValueXY({ x: baseLeft, y: 0 })).current;
  const widthAnim = useRef(new Animated.Value(baseWidth)).current;

  // Keep refs for pan responder to avoid stale closures
  const segmentRef = useRef(segment);
  const zoomRef = useRef(zoomLevel);
  useEffect(() => {
    // Keep pan in sync with data changes (e.g. undo, external edits)
    pan.setValue({ x: segment.start * zoomLevel, y: 0 });
    widthAnim.setValue(segment.duration * zoomLevel);
    segmentRef.current = segment;
    zoomRef.current = zoomLevel;
  }, [pan, segment, widthAnim, zoomLevel]);

  useEffect(() => {
    if (segment.type === 'video' && segment.src && Platform.OS === 'web') {
      let isMounted = true;
      // Extract 1 frame every 5 seconds (adjust interval based on zoomLevel if needed)
      FrameExtractor.extractFrames(segment.src, segment.duration, 5).then((f) => {
        if (isMounted) setFrames(f);
      });
      return () => { isMounted = false; };
    }
  }, [segment.src, segment.duration, segment.type]);

  // Trimming from the RIGHT
  const rightPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => {
        useEditorStore.getState().selectSegment(segmentRef.current.id);
        return true;
      },
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderMove: (evt, gestureState) => {
        const currentWidth = segmentRef.current.duration * zoomRef.current;
        const newWidth = Math.max(20, currentWidth + gestureState.dx);
        widthAnim.setValue(newWidth);
      },
      onPanResponderRelease: (evt, gestureState) => {
        const s = segmentRef.current;
        const z = zoomRef.current;
        const currentWidth = s.duration * z;
        const finalWidth = Math.max(20, currentWidth + gestureState.dx);
        const newDuration = finalWidth / z;
        const newTrimEnd = (s.trimEnd || 0) + (gestureState.dx / z); // Add delta to trimEnd

        updateSegment(s.trackId, s.id, { 
          duration: newDuration,
          end: s.start + newDuration,
          trimEnd: Math.max(0, newTrimEnd)
        });
      },
    })
  ).current;

  // Trimming from the LEFT
  const leftPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => {
        useEditorStore.getState().selectSegment(segmentRef.current.id);
        return true;
      },
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderMove: (evt, gestureState) => {
        const s = segmentRef.current;
        const z = zoomRef.current;
        const currentWidth = s.duration * z;
        const currentLeft = s.start * z;

        const maxDx = currentWidth - 20; // Can't shrink below 20px
        const actualDx = Math.min(gestureState.dx, maxDx);
        const boundedDx = Math.max(-currentLeft, actualDx); // Can't drag past 0
        
        pan.setValue({ x: currentLeft + boundedDx, y: 0 });
        widthAnim.setValue(currentWidth - boundedDx);
      },
      onPanResponderRelease: (evt, gestureState) => {
        const s = segmentRef.current;
        const z = zoomRef.current;
        const currentWidth = s.duration * z;
        const currentLeft = s.start * z;

        const maxDx = currentWidth - 20;
        const actualDx = Math.min(gestureState.dx, maxDx);
        const boundedDx = Math.max(-currentLeft, actualDx);
        
        const newStart = (currentLeft + boundedDx) / z;
        const newDuration = (currentWidth - boundedDx) / z;
        const trimSecondsDelta = boundedDx / z;
        
        const newTrimStart = (s.trimStart || 0) + trimSecondsDelta;

        updateSegment(s.trackId, s.id, { 
          start: newStart, 
          duration: newDuration,
          trimStart: Math.max(0, newTrimStart)
        });
      },
    })
  ).current;

  // Moving the ENTIRE CLIP
  const movePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        selectSegment(segment.id);
        setActivePreviewMode('program'); // Ensure we are previewing the timeline
      },
      onPanResponderMove: (evt, gestureState) => {
        const s = segmentRef.current;
        const z = zoomRef.current;
        const currentLeft = s.start * z;
        const boundedX = Math.max(0, currentLeft + gestureState.dx);
        pan.setValue({ x: boundedX, y: 0 });
      },
        onPanResponderRelease: (evt, gestureState) => {
          const s = segmentRef.current;
          
          if (Math.abs(gestureState.dx) < 5 && Math.abs(gestureState.dy) < 5) {
            useEditorStore.getState().selectSegment(s.id);
            useEditorStore.getState().setActivePreviewMode('program');
            return;
          }
          
          const z = zoomRef.current;
          const currentLeft = s.start * z;
          const finalX = Math.max(0, currentLeft + gestureState.dx);
        let newStart = finalX / z;
        
        // Magnetic Snapping
        const track = useEditorStore.getState().tracks.find(t => t.id === s.trackId);
        if (track) {
          const SNAP_THRESHOLD = 20 / z; // 20 pixels snapping distance
          let bestSnapDist = Infinity;
          let snappedStart = newStart;
          
          track.segments.forEach(other => {
            if (other.id === s.id) return;
            // Snap newStart to other.end
            const distToOtherEnd = Math.abs(newStart - other.end);
            if (distToOtherEnd < SNAP_THRESHOLD && distToOtherEnd < bestSnapDist) {
              bestSnapDist = distToOtherEnd;
              snappedStart = other.end;
            }
            // Snap newEnd to other.start (meaning newStart = other.start - s.duration)
            const distToOtherStart = Math.abs((newStart + s.duration) - other.start);
            if (distToOtherStart < SNAP_THRESHOLD && distToOtherStart < bestSnapDist) {
              bestSnapDist = distToOtherStart;
              snappedStart = other.start - s.duration;
            }
          });
          if (bestSnapDist !== Infinity) {
            newStart = snappedStart;
          }
        }
        
        updateSegment(s.trackId, s.id, { 
          start: newStart,
          end: newStart + s.duration
        });
      },
    })
  ).current;

  const getBackgroundColor = () => {
    switch (segment.type) {
      case 'video': return '#1e3a8a'; // Blue-900 (deep premium)
      case 'audio': return '#064e3b'; // Emerald-900
      case 'text': return '#78350f';  // Amber-900
      case 'effect': return '#4c1d95'; // Violet-900
      case 'live': return '#14532d';  // Green-900 (live feed)
      case 'image': return '#1e3a5a'; // Slate-Blue (image/background)
      default: return '#1e3a8a';
    }
  };

  const handleWidth = Math.min(15, (segment.duration * zoomLevel) / 3);

  return (
    <Animated.View style={[
      styles.container,
      {
        width: widthAnim,
        transform: [{ translateX: pan.x }],
        zIndex: isSelected ? 100 : 1,
      }
    ]}>
      <View
        style={[
          styles.segment,
          {
            backgroundColor: getBackgroundColor(),
            borderColor: isSelected ? '#06b6d4' : 'rgba(255,255,255,0.05)',
            borderWidth: isSelected ? 2 : 1,
            marginRight: 2, // Physical gap between clips
            overflow: 'hidden', 
            ...(Platform.OS === 'web' ? ({ touchAction: 'none', cursor: 'grab' } as never) : {})
          }
        ]}
        {...movePanResponder.panHandlers}
      >
        {/* Top Bar for Clip Info */}
        <View style={styles.clipTopBar} pointerEvents="none">
          <Text style={styles.text} numberOfLines={1}>
            {segment.type === 'text' 
            ? segment.text 
            : segment.type === 'live' || segment.src === 'LIVE_FEED'
              ? `📹 Live Feed ∞`
              : `🎬 ${segment.src?.split('/').pop()?.substring(0,10) || segment.type} ${Math.floor(segment.duration / 60)}:${Math.floor(segment.duration % 60).toString().padStart(2, '0')}`}
          </Text>
        </View>
        
        {/* Filmstrip Row */}
        {segment.type === 'video' && frames.length > 0 && (
          <View style={styles.filmstripRow} pointerEvents="none">
            {frames.map((frameUri, idx) => (
              <Image 
                key={idx} 
                source={{ uri: frameUri }} 
                alt="Video frame"
                style={{ width: 5 * zoomLevel, height: 24, marginRight: 0 }} 
                resizeMode="cover" 
              />
            ))}
          </View>
        )}
        
        {segment.type === 'video' && frames.length === 0 && (
          <View style={styles.loadingStrip}>
            <Text style={{color: '#a1a1aa', fontSize: 10}}>Generating frames...</Text>
          </View>
        )}

        {/* Audio Waveform */}
        {(segment.type === 'video' || segment.type === 'audio') && (
          <Waveform segment={segment} zoomLevel={zoomLevel} />
        )}

        {/* Transition Indicator */}
        {segment.transitionOut && (
          <TouchableOpacity 
            style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 16, backgroundColor: 'rgba(234,179,8,0.3)', justifyContent: 'center', alignItems: 'center', borderLeftWidth: 1, borderLeftColor: '#eab308' }}
            onPress={(e) => {
              e.stopPropagation();
              const transition = segment.transitionOut;
              if (!transition) return;
              const currentDur = typeof transition === 'object' ? (transition.duration || 1).toString() : "1";
              if (Platform.OS === 'web') {
                const dur = window.prompt("Enter transition duration (seconds):", currentDur);
                if (dur && !isNaN(parseFloat(dur))) {
                  const type = typeof transition === 'object' ? transition.type : transition;
                  updateSegment(segment.trackId, segment.id, {
                    transitionOut: { type, duration: parseFloat(dur) }
                  });
                }
              } else {
                Alert.prompt(
                  "Transition Duration",
                  "Enter duration in seconds:",
                  [
                    { text: "Cancel", style: "cancel" },
                    { text: "Save", onPress: (dur?: string) => {
                      if (dur && !isNaN(parseFloat(dur))) {
                        const type = typeof transition === 'object' ? transition.type : transition;
                        updateSegment(segment.trackId, segment.id, {
                          transitionOut: { type, duration: parseFloat(dur) }
                        });
                      }
                    }}
                  ],
                  "plain-text",
                  currentDur
                );
              }
            }}
          >
            <Text style={{ fontSize: 8 }}>T</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Trimming Handles (Always visible for discoverability) */}
      <View 
        style={[styles.handle, styles.leftHandle, { width: handleWidth }, isSelected && styles.handleActive, Platform.OS === 'web' && ({ touchAction: 'none' } as never)]} 
        {...leftPanResponder.panHandlers} 
      >
        <View style={styles.handleBar} />
      </View>
      <View 
        style={[styles.handle, styles.rightHandle, { width: handleWidth }, isSelected && styles.handleActive, Platform.OS === 'web' && ({ touchAction: 'none' } as never)]} 
        {...rightPanResponder.panHandlers} 
      >
        <View style={styles.handleBar} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    height: 60,
    top: 8,
  },
  segment: {
    flex: 1,
    borderRadius: 6,
    justifyContent: 'center',
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  text: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  handle: {
    position: 'absolute',
    top: -2,
    bottom: -2,
    width: 24,
    backgroundColor: 'rgba(0,0,0,0.3)', // Always visible dark overlay
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20, // Render above the segment body!
  },
  handleActive: {
    backgroundColor: 'rgba(6,182,212,0.2)', // Cyan glow when selected
  },
  leftHandle: {
    left: -12,
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
  },
  rightHandle: {
    right: -12,
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
  },
  handleBar: {
    width: 4,
    height: 16,
    backgroundColor: '#fff',
    borderRadius: 2,
    shadowColor: '#06b6d4',
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  clipTopBar: {
    height: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  filmstripRow: {
    flex: 1,
    flexDirection: 'row',
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  loadingStrip: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
