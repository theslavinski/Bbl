import React, { memo, useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useGameStore } from '@/store';
import { colors, fonts, spacing, radius } from '@/theme/terminal';
import type { ActionDefinition } from '@/types/game';

// ─── Action definitions (static data — not in store) ─────────────────────────

const ACTIONS: ActionDefinition[] = [
  {
    id: 'synth_o2',
    label: 'SYNTH O2',
    cooldown: 4000,
    effects: { oxygen: 8 },
    log: '[ACT] Oxygen synthesis cycle complete. +8 O2.',
  },
  {
    id: 'boost_power',
    label: 'BOOST PWR',
    cooldown: 5000,
    effects: { energy: 10 },
    log: '[ACT] Capacitor boost engaged. +10 Energy.',
  },
  {
    id: 'scan_sector',
    label: 'SCAN SECTOR',
    cooldown: 6000,
    effects: { data: 12 },
    log: '[ACT] Sector scan complete. +12 Data.',
  },
  {
    id: 'repair_hull',
    label: 'PATCH HULL',
    cooldown: 8000,
    effects: { hull: 6, energy: -4 },
    log: '[ACT] Hull micropatch applied. +6 Hull, -4 Energy.',
  },
];

// ─── Single action button ─────────────────────────────────────────────────────

interface ActionButtonProps {
  action: ActionDefinition;
}

const ActionButton = memo(function ActionButton({ action }: ActionButtonProps) {
  const applyDelta = useGameStore((s) => s.applyDelta);
  const addLog = useGameStore((s) => s.addLog);
  const setActionCooldown = useGameStore((s) => s.setActionCooldown);
  const isActionReady = useGameStore((s) => s.isActionReady);
  const actionCooldowns = useGameStore((s) => s.actionCooldowns);

  // Local tick to re-render cooldown UI at ~4fps
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 250);
    return () => clearInterval(id);
  }, []);
  void tick; // consumed only for side-effect re-render

  const ready = isActionReady(action.id);
  const expiresAt = actionCooldowns[action.id];
  const remaining = expiresAt ? Math.max(0, expiresAt - Date.now()) : 0;
  const cooldownPct = expiresAt
    ? 1 - remaining / action.cooldown
    : 1;

  const onPress = useCallback(() => {
    if (!isActionReady(action.id)) return;
    applyDelta(action.effects);
    addLog(action.log, 'action');
    setActionCooldown(action.id, Date.now() + action.cooldown);
  }, [action, applyDelta, addLog, setActionCooldown, isActionReady]);

  return (
    <Pressable
      onPress={onPress}
      disabled={!ready}
      style={({ pressed }) => [
        styles.button,
        !ready && styles.buttonDisabled,
        pressed && ready && styles.buttonPressed,
      ]}
    >
      {/* Cooldown fill */}
      <View
        style={[
          styles.cooldownFill,
          { width: `${cooldownPct * 100}%` as `${number}%` },
        ]}
      />
      <Text style={[styles.label, !ready && styles.labelDisabled]}>
        {action.label}
      </Text>
      {!ready && (
        <Text style={styles.cooldownText}>
          {(remaining / 1000).toFixed(1)}s
        </Text>
      )}
    </Pressable>
  );
});

// ─── Panel ────────────────────────────────────────────────────────────────────

function ActionPanelComponent() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>── ACTIONS ──────────────────────────</Text>
      <View style={styles.grid}>
        {ACTIONS.map((a) => (
          <ActionButton key={a.id} action={a} />
        ))}
      </View>
    </View>
  );
}

export const ActionPanel = memo(ActionPanelComponent);

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: spacing.xs,
  },
  header: {
    fontFamily: fonts.mono,
    fontSize: fonts.size.xxs,
    color: colors.dim,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    letterSpacing: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.sm,
    gap: spacing.xs,
  },
  button: {
    width: '48%',
    minWidth: 130,
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  buttonDisabled: {
    borderColor: colors.borderDim,
    backgroundColor: colors.bg,
  },
  buttonPressed: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.secondary,
  },
  cooldownFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.muted,
    opacity: 0.4,
  },
  label: {
    fontFamily: fonts.mono,
    fontSize: fonts.size.sm,
    color: colors.primary,
    letterSpacing: 2,
  },
  labelDisabled: {
    color: colors.dim,
  },
  cooldownText: {
    position: 'absolute',
    right: spacing.xs,
    fontFamily: fonts.mono,
    fontSize: fonts.size.xxs,
    color: colors.dim,
  },
});
