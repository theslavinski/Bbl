import React, { memo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { colors } from '@/theme/terminal';

const { height: SCREEN_H } = Dimensions.get('screen');
const LINE_HEIGHT = 3; // px per scanline pair
const LINE_COUNT = Math.ceil(SCREEN_H / LINE_HEIGHT);

/**
 * Renders a grid of semi-transparent horizontal bands simulating CRT scanlines.
 * Uses a fixed pattern — no state, no re-renders after mount.
 */
function CRTOverlayComponent() {
  return (
    <View style={styles.overlay} pointerEvents="none">
      {/* Scanline grid */}
      <View style={styles.scanlines}>
        {Array.from({ length: LINE_COUNT }, (_, i) => (
          <View key={i} style={i % 2 === 0 ? styles.scanlineOn : styles.scanlineOff} />
        ))}
      </View>
      {/* Phosphor glow vignette */}
      <View style={styles.vignette} />
    </View>
  );
}

export const CRTOverlay = memo(CRTOverlayComponent);

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99,
  },
  scanlines: {
    flex: 1,
  },
  scanlineOn: {
    height: 1,
    backgroundColor: colors.scanline,
  },
  scanlineOff: {
    height: 2,
    backgroundColor: 'transparent',
  },
  vignette: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    // Radial-like shadow inset using a dark border that fades inward
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 80,
    borderWidth: 40,
    borderColor: 'rgba(0,0,0,0.4)',
  },
});
