import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useGameStore, selectResources } from '@/store';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { colors, spacing } from '@/theme/terminal';
import type { ResourceKey } from '@/types/game';

const RESOURCE_CONFIG: { key: ResourceKey; label: string; color: string }[] = [
  { key: 'oxygen', label: 'O2  ', color: '#00ccff' },
  { key: 'energy', label: 'PWR ', color: '#ffdd00' },
  { key: 'data',   label: 'DAT ', color: colors.primary },
  { key: 'hull',   label: 'HULL', color: '#ff6600' },
];

function ResourceBarComponent() {
  const resources = useGameStore(selectResources);

  return (
    <View style={styles.container}>
      {RESOURCE_CONFIG.map(({ key, label, color }) => {
        const r = resources[key];
        if (!r) return null;
        return (
          <ProgressBar
            key={key}
            label={label}
            value={r.current}
            max={r.max}
            color={color}
          />
        );
      })}
    </View>
  );
}

export const ResourceBar = memo(ResourceBarComponent);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.xxs,
  },
});
