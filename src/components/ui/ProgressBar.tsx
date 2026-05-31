import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, spacing } from '@/theme/terminal';

interface ProgressBarProps {
  label: string;
  value: number;
  max: number;
  color?: string;
  showValue?: boolean;
}

function ProgressBarComponent({ label, value, max, color = colors.primary, showValue = true }: ProgressBarProps) {
  const pct = max > 0 ? Math.min(1, value / max) : 0;
  const displayPct = Math.round(pct * 100);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        {showValue && (
          <Text style={[styles.label, { color }]}>
            {Math.floor(value)}/{max} [{displayPct}%]
          </Text>
        )}
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: color }]} />
        <View style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: color, opacity: 0.15, position: 'absolute', top: 0, left: 0, height: '100%' }]} />
      </View>
    </View>
  );
}

export const ProgressBar = memo(ProgressBarComponent);

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xxs,
  },
  label: {
    fontFamily: fonts.mono,
    fontSize: fonts.size.xs,
    color: colors.textDim,
    letterSpacing: 0.5,
  },
  track: {
    height: 6,
    backgroundColor: colors.borderDim,
    borderRadius: 1,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 1,
  },
});
