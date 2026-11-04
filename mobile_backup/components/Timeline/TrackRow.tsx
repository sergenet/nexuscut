import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Track } from '../../store/useEditorStore';
import SegmentItem from './SegmentItem';

interface TrackRowProps {
  track: Track;
}

export default function TrackRow({ track }: TrackRowProps) {
  return (
    <View style={styles.container}>
      {/* Track Header (Sticky Left equivalent for mobile) */}
      <View style={styles.header}>
        <Text style={styles.headerText} numberOfLines={1}>{track.name}</Text>
      </View>

      {/* Track Canvas */}
      <View style={styles.canvas}>
        {track.segments.map(segment => (
          <SegmentItem key={segment.id} segment={segment} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 76,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.03)',
    backgroundColor: 'rgba(9, 9, 11, 0.4)', // Very subtle dark background for tracks
  },
  header: {
    width: 80,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.05)',
    backgroundColor: 'rgba(15, 23, 42, 0.8)', // Slate-900 with some transparency
    justifyContent: 'center',
    paddingHorizontal: 8,
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 10,
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' } : {}),
  },
  headerText: {
    color: '#94a3b8', // slate-400
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  canvas: {
    flex: 1,
    position: 'relative',
  }
});
