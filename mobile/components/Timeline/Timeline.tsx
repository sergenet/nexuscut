import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions, PanResponder, Animated, Platform } from 'react-native';
import { useEditorStore } from '../../store/useEditorStore';
import TrackRow from './TrackRow';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function Timeline() {
  const { 
    tracks, 
    videoDuration, 
    zoomLevel, 
    setZoomLevel,
    currentTime,
    setCurrentTime,
    isPlaying,
    setActivePreviewMode,
    setTimelineScrollX
  } = useEditorStore();

  // Removed mock data so the timeline starts empty for the user to build their own!

  // Headless Timeline Dragging (Using Animated.Value instead of ScrollView)
  const [scrollX, setScrollX] = useState(0);
  const panX = useRef(new Animated.Value(0)).current;
  const currentScrollX = useRef(0);
  const initialScrollX = useRef(0);
  const timelineWidth = Math.max(SCREEN_WIDTH * 2, videoDuration * zoomLevel + SCREEN_WIDTH);
  
  useEffect(() => {
    setTimelineScrollX(scrollX);
  }, [scrollX, setTimelineScrollX]);
  
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 5;
      },
      onPanResponderGrant: () => {
        initialScrollX.current = currentScrollX.current;
      },
      onPanResponderMove: (_, gestureState) => {
        setActivePreviewMode('program');
        // Let it pan freely across the timeline width without arbitrary screen width clamping
        const newX = Math.max(0, Math.min(timelineWidth, initialScrollX.current - gestureState.dx));
        panX.setValue(-newX);
      },
      onPanResponderRelease: (_, gestureState) => {
        const finalX = Math.max(0, Math.min(timelineWidth, initialScrollX.current - gestureState.dx));
        currentScrollX.current = finalX;
        setScrollX(finalX);
      },
      onPanResponderTerminate: (_, gestureState) => {
        // Handle if gesture is interrupted
        const finalX = Math.max(0, Math.min(timelineWidth - SCREEN_WIDTH, initialScrollX.current - gestureState.dx));
        currentScrollX.current = finalX;
        setScrollX(finalX);
      }
    })
  ).current;

  // Ruler Scrubbing Engine
  const initialRulerClickX = useRef(0);
  const rulerPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        useEditorStore.getState().setActivePreviewMode('program');
        useEditorStore.getState().setIsPlaying(false); // Pause video when grabbed
        initialRulerClickX.current = evt.nativeEvent.locationX;
        if (initialRulerClickX.current >= 0) {
          setCurrentTime(Math.max(0, initialRulerClickX.current / zoomLevel));
        }
      },
      onPanResponderMove: (_, gestureState) => {
        setActivePreviewMode('program');
        const moveX = initialRulerClickX.current + gestureState.dx;
        if (moveX >= 0) {
          setCurrentTime(Math.max(0, moveX / zoomLevel));
        }
      }
    })
  ).current;

  // Playhead Scrubbing Engine
  const initialPlayheadTime = useRef(0);
  const playheadPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderGrant: () => {
        useEditorStore.getState().setActivePreviewMode('program');
        useEditorStore.getState().setIsPlaying(false); // Pause video when grabbed
        initialPlayheadTime.current = useEditorStore.getState().currentTime;
      },
      onPanResponderMove: (_, gestureState) => {
        const currentZoom = useEditorStore.getState().zoomLevel;
        const timeDelta = gestureState.dx / currentZoom;
        const newTime = Math.max(0, initialPlayheadTime.current + timeDelta);
        useEditorStore.getState().setCurrentTime(newTime);
      },
      onPanResponderTerminationRequest: () => false, // Refuse to give up gesture
    })
  ).current;

  // Sync scroll state back to panX when playhead jumps
  useEffect(() => {
    panX.setValue(-scrollX);
    currentScrollX.current = scrollX;
  }, [panX, scrollX]);

  // Auto-scroll the timeline when the video is playing (Page Flip Style)
  useEffect(() => {
    let nextScroll: number | null = null;
    if (isPlaying) {
      const playheadX = currentTime * zoomLevel;
      // If the playhead goes past the right edge (minus a 50px buffer), flip the page forward!
      if (playheadX > scrollX + SCREEN_WIDTH - 50) {
        nextScroll = playheadX - 100;
      } 
      // If the playhead goes past the left edge, flip the page backward!
      else if (playheadX < scrollX) {
        nextScroll = Math.max(0, playheadX - 100);
      }
    }
    if (nextScroll === null) return;
    const frame = requestAnimationFrame(() => setScrollX(nextScroll));
    return () => cancelAnimationFrame(frame);
  }, [currentTime, isPlaying, zoomLevel, scrollX]);



  return (
    <View style={styles.container}>
      
      {/* Timeline Toolbar (Zoom Controls) */}
      <View style={styles.toolbar}>
        <Text style={styles.toolbarTitle}>Timeline Editor</Text>
        <View style={styles.zoomControls}>
          <TouchableOpacity 
            style={styles.zoomBtn} 
            onPress={() => setZoomLevel(Math.max(2, zoomLevel - 5))}
          >
            <Ionicons name="remove" size={16} color="#a1a1aa" />
          </TouchableOpacity>
          <Text style={styles.zoomText}>{zoomLevel}x</Text>
          <TouchableOpacity 
            style={styles.zoomBtn} 
            onPress={() => setZoomLevel(Math.min(100, zoomLevel + 5))}
          >
            <Ionicons name="add" size={16} color="#a1a1aa" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.zoomBtn, { marginLeft: 8, paddingHorizontal: 8 }]} 
            onPress={() => {
              // Auto-fit to screen
              const fitZoom = Math.max(2, Math.floor((SCREEN_WIDTH - 40) / Math.max(1, videoDuration)));
              setZoomLevel(Math.min(50, fitZoom));
            }}
          >
            <Text style={styles.zoomBtnText}>Fit</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.timeDisplay}>00:{(currentTime).toFixed(1)}</Text>
      </View>

      {/* Timeline ScrollArea */}
      <View 
        style={[styles.scrollArea, { overflow: 'hidden' }, Platform.OS === 'web' && ({ touchAction: 'none' } as never)]}
        {...panResponder.panHandlers}
      >
        <Animated.View 
          style={[
            styles.tracksContainer, 
            { width: timelineWidth, transform: [{ translateX: panX }] }
          ]}
        >
          {/* Time Ruler */}
          <View 
            style={styles.ruler}
            {...rulerPanResponder.panHandlers}
          >
            <View style={styles.rulerHeader} />
            <View style={styles.rulerTicks}>
              {[...Array(Math.ceil(videoDuration) + 1)].map((_, i) => {
                if (i % 5 !== 0) return null;
                return (
                  <View key={i} style={[styles.tick, { left: i * zoomLevel }]}>
                    <Text style={styles.tickText}>00:{i.toString().padStart(2, '0')}</Text>
                    <View style={styles.tickMark} />
                  </View>
                );
              })}
            </View>
          </View>

          {/* Tracks */}
          <View style={styles.tracksWrapper}>
            {tracks.map(track => (
              <TrackRow key={track.id} track={track} />
            ))}
          </View>

          {/* Interactive Playhead */}
          <View 
            style={[styles.playheadWrapper, { left: (currentTime * zoomLevel) + 80 - 20 }]}
            pointerEvents="auto"
            {...playheadPanResponder.panHandlers}
          >
            <View style={styles.playheadHandle}>
              <View style={styles.playheadTeardrop} />
            </View>
            <View style={styles.playheadLine} />
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b', // Zinc-950
    borderTopWidth: 1,
    borderTopColor: '#27272a', // Zinc-800
  },
  toolbar: {
    height: 48,
    backgroundColor: '#0f0f11',
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
  },
  toolbarTitle: {
    color: '#e4e4e7',
    fontSize: 12,
    fontWeight: '700',
  },
  zoomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(24, 24, 27, 0.6)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    padding: 4,
  },
  zoomBtn: {
    padding: 4,
    backgroundColor: '#27272a',
    borderRadius: 4,
  },
  zoomBtnText: {
    color: '#a1a1aa',
    fontSize: 12,
    fontWeight: '600',
  },
  zoomText: {
    color: '#e4e4e7',
    fontSize: 12,
    marginHorizontal: 8,
    fontVariant: ['tabular-nums'],
  },
  timeDisplay: {
    color: '#10b981', // Emerald-500
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  scrollArea: {
    flex: 1,
  },
  tracksContainer: {
    flex: 1,
  },
  ruler: {
    height: 28,
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.4)', // Subtle slate tint
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  rulerHeader: {
    width: 80,
    backgroundColor: '#18181b',
    borderRightWidth: 1,
    borderRightColor: '#27272a',
  },
  rulerTicks: {
    flex: 1,
    position: 'relative',
  },
  tick: {
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
  },
  tickText: {
    color: '#a1a1aa', // Zinc-400
    fontSize: 10,
    marginBottom: 2,
    marginLeft: -10,
  },
  tickMark: {
    width: 1,
    height: 8,
    backgroundColor: '#3f3f46', // Zinc-700
  },
  tracksWrapper: {
    position: 'relative',
    flex: 1,
  },
  playheadWrapper: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 40,
    alignItems: 'center',
    zIndex: 999,
  },
  playheadHandle: {
    width: 14,
    height: 18,
    backgroundColor: '#06b6d4', // Electric Cyan
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
    shadowColor: '#06b6d4',
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  playheadTeardrop: {
    width: 2,
    height: 6,
    backgroundColor: '#082f49', // Deep contrast
    borderRadius: 2,
    marginTop: 2,
  },
  playheadLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#06b6d4',
    shadowColor: '#06b6d4',
    shadowOpacity: 0.5,
    shadowRadius: 4,
  }
});
