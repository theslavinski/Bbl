import React, { memo, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useGameStore, selectModuleDefinitions, selectOwnedModules, selectResources } from '@/store';
import { colors, fonts, spacing, radius } from '@/theme/terminal';
import type { ModuleDefinition } from '@/types/game';

interface ModuleCardProps {
  def: ModuleDefinition;
  ownedCount: number;
  canAfford: boolean;
  onBuy: (id: string) => void;
}

const ModuleCard = memo(function ModuleCard({ def, ownedCount, canAfford, onBuy }: ModuleCardProps) {
  const handleBuy = useCallback(() => onBuy(def.id), [def.id, onBuy]);
  const atMax = def.maxOwned !== undefined && ownedCount >= def.maxOwned;

  const costStr = Object.entries(def.cost)
    .map(([k, v]) => `${v} ${k.toUpperCase()}`)
    .join(', ');

  const bonusStr = Object.entries(def.tickBonus)
    .map(([k, v]) => `+${v}/s ${k.toUpperCase()}`)
    .join(', ');

  return (
    <View style={[styles.card, atMax && styles.cardMaxed]}>
      <View style={styles.cardHeader}>
        <Text style={styles.moduleName}>{def.name}</Text>
        <Text style={styles.ownedBadge}>
          {ownedCount}/{def.maxOwned ?? '∞'}
        </Text>
      </View>
      <Text style={styles.description}>{def.description}</Text>
      <Text style={styles.bonus}>{bonusStr}</Text>
      <View style={styles.cardFooter}>
        <Text style={[styles.cost, !canAfford && styles.costInsufficient]}>
          COST: {costStr}
        </Text>
        <Pressable
          onPress={handleBuy}
          disabled={!canAfford || atMax}
          style={({ pressed }) => [
            styles.buyBtn,
            (!canAfford || atMax) && styles.buyBtnDisabled,
            pressed && canAfford && !atMax && styles.buyBtnPressed,
          ]}
        >
          <Text style={[styles.buyLabel, (!canAfford || atMax) && styles.buyLabelDisabled]}>
            {atMax ? 'MAXED' : 'INSTALL'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
});

function ResearchScreenComponent() {
  const defs = useGameStore(selectModuleDefinitions);
  const owned = useGameStore(selectOwnedModules);
  const resources = useGameStore(selectResources);
  const purchaseModule = useGameStore((s) => s.purchaseModule);

  const handleBuy = useCallback((id: string) => purchaseModule(id), [purchaseModule]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.header}>
        {'┌─ MODULE ACQUISITION TERMINAL ─────────────────┐'}
      </Text>
      <Text style={styles.subHeader}>
        Install software modules for passive resource generation.
      </Text>
      <View style={styles.list}>
        {defs.map((def) => {
          const ownedCount = owned.find((o) => o.moduleId === def.id)?.count ?? 0;
          const canAfford = Object.entries(def.cost).every(
            ([k, v]) => (resources[k as keyof typeof resources]?.current ?? 0) >= v,
          );
          return (
            <ModuleCard
              key={def.id}
              def={def}
              ownedCount={ownedCount}
              canAfford={canAfford}
              onBuy={handleBuy}
            />
          );
        })}
      </View>
    </ScrollView>
  );
}

export const ResearchScreen = memo(ResearchScreenComponent);

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
    letterSpacing: 0.5,
  },
  subHeader: {
    fontFamily: fonts.mono,
    fontSize: fonts.size.xs,
    color: colors.textDim,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  list: {
    padding: spacing.sm,
    gap: spacing.sm,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    gap: spacing.xs,
  },
  cardMaxed: {
    borderColor: colors.muted,
    opacity: 0.6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  moduleName: {
    fontFamily: fonts.mono,
    fontSize: fonts.size.md,
    color: colors.textBright,
    letterSpacing: 1,
  },
  ownedBadge: {
    fontFamily: fonts.mono,
    fontSize: fonts.size.xs,
    color: colors.accent,
  },
  description: {
    fontFamily: fonts.mono,
    fontSize: fonts.size.xs,
    color: colors.textDim,
    lineHeight: 16,
  },
  bonus: {
    fontFamily: fonts.mono,
    fontSize: fonts.size.xs,
    color: colors.primary,
    letterSpacing: 0.5,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xxs,
  },
  cost: {
    fontFamily: fonts.mono,
    fontSize: fonts.size.xs,
    color: colors.secondary,
    flex: 1,
  },
  costInsufficient: {
    color: colors.error,
  },
  buyBtn: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    backgroundColor: colors.surface,
  },
  buyBtnDisabled: {
    borderColor: colors.border,
  },
  buyBtnPressed: {
    backgroundColor: colors.surfaceRaised,
  },
  buyLabel: {
    fontFamily: fonts.mono,
    fontSize: fonts.size.xs,
    color: colors.primary,
    letterSpacing: 2,
  },
  buyLabelDisabled: {
    color: colors.dim,
  },
});
