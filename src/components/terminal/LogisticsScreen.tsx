import React, { memo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useGameStore, selectOwnedModules, selectModuleDefinitions, selectResources } from '@/store';
import { colors, fonts, spacing, radius } from '@/theme/terminal';
import type { ResourceKey } from '@/types/game';

const RESOURCE_KEYS: ResourceKey[] = ['oxygen', 'energy', 'data', 'hull'];

function LogisticsScreenComponent() {
  const owned = useGameStore(selectOwnedModules);
  const defs = useGameStore(selectModuleDefinitions);
  const resources = useGameStore(selectResources);

  // Aggregate total tick rates
  const totalRates = RESOURCE_KEYS.reduce<Record<ResourceKey, number>>(
    (acc, k) => ({ ...acc, [k]: resources[k]?.perTick ?? 0 }),
    {} as Record<ResourceKey, number>,
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.header}>
        {'┌─ LOGISTICS OVERVIEW ─────────────────────────┐'}
      </Text>

      {/* Production rates */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>── PRODUCTION RATES (/sec)</Text>
        {RESOURCE_KEYS.map((k) => (
          <View key={k} style={styles.rateRow}>
            <Text style={styles.rateLabel}>{k.toUpperCase().padEnd(8)}</Text>
            <Text style={[styles.rateValue, (totalRates[k] ?? 0) > 0 && styles.ratePositive]}>
              {(totalRates[k] ?? 0) > 0 ? `+${(totalRates[k] ?? 0).toFixed(2)}` : '  0.00'}
            </Text>
          </View>
        ))}
      </View>

      {/* Installed modules */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>── INSTALLED MODULES</Text>
        {owned.length === 0 ? (
          <Text style={styles.empty}>No modules installed. Visit RESEARCH to acquire.</Text>
        ) : (
          owned.map((o) => {
            const def = defs.find((d) => d.id === o.moduleId);
            if (!def) return null;
            const bonusStr = Object.entries(def.tickBonus)
              .map(([k, v]) => `+${(v * o.count).toFixed(2)}/s ${k.toUpperCase()}`)
              .join('  ');
            return (
              <View key={o.moduleId} style={styles.moduleRow}>
                <View style={styles.moduleInfo}>
                  <Text style={styles.moduleName}>{def.name}</Text>
                  <Text style={styles.moduleBonus}>{bonusStr}</Text>
                </View>
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>×{o.count}</Text>
                </View>
              </View>
            );
          })
        )}
      </View>

      {/* Resource snapshot */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>── RESOURCE SNAPSHOT</Text>
        {RESOURCE_KEYS.map((k) => {
          const r = resources[k];
          if (!r) return null;
          return (
            <View key={k} style={styles.snapshotRow}>
              <Text style={styles.snapshotLabel}>{k.toUpperCase()}</Text>
              <Text style={styles.snapshotValue}>
                {r.current.toFixed(1)} / {r.max}
              </Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

export const LogisticsScreen = memo(LogisticsScreenComponent);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    fontFamily: fonts.mono,
    fontSize: fonts.size.xxs,
    color: colors.dim,
    padding: spacing.sm,
  },
  section: {
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderDim,
  },
  sectionTitle: {
    fontFamily: fonts.mono,
    fontSize: fonts.size.xxs,
    color: colors.dim,
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  rateRow: {
    flexDirection: 'row',
    paddingVertical: spacing.xxs,
  },
  rateLabel: {
    fontFamily: fonts.mono,
    fontSize: fonts.size.sm,
    color: colors.textDim,
    width: 80,
  },
  rateValue: {
    fontFamily: fonts.mono,
    fontSize: fonts.size.sm,
    color: colors.dim,
  },
  ratePositive: {
    color: colors.primary,
  },
  empty: {
    fontFamily: fonts.mono,
    fontSize: fonts.size.xs,
    color: colors.muted,
    fontStyle: 'italic',
  },
  moduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderDim,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.xs,
    backgroundColor: colors.surface,
  },
  moduleInfo: {
    flex: 1,
    gap: spacing.xxs,
  },
  moduleName: {
    fontFamily: fonts.mono,
    fontSize: fonts.size.sm,
    color: colors.textNormal,
  },
  moduleBonus: {
    fontFamily: fonts.mono,
    fontSize: fonts.size.xxs,
    color: colors.primary,
  },
  countBadge: {
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
  },
  countText: {
    fontFamily: fonts.mono,
    fontSize: fonts.size.sm,
    color: colors.accent,
  },
  snapshotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xxs,
  },
  snapshotLabel: {
    fontFamily: fonts.mono,
    fontSize: fonts.size.sm,
    color: colors.textDim,
  },
  snapshotValue: {
    fontFamily: fonts.mono,
    fontSize: fonts.size.sm,
    color: colors.secondary,
  },
});
