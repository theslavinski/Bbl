import React, { memo, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useGameStore, selectActiveTab } from '@/store';
import { useGameTick } from '@/hooks/useGameTick';
import { useEventTrigger } from '@/hooks/useEventTrigger';
import { ResourceBar } from './ResourceBar';
import { LogFeed } from './LogFeed';
import { ActionPanel } from './ActionPanel';
import { EventModal } from './EventModal';
import { TabBar } from './TabBar';
import { ResearchScreen } from './ResearchScreen';
import { LogisticsScreen } from './LogisticsScreen';
import { CRTOverlay } from '@/components/ui/CRTOverlay';
import { colors, fonts, spacing } from '@/theme/terminal';

// ─── Screens per tab ──────────────────────────────────────────────────────────

const TerminalTabContent = memo(function TerminalTabContent() {
  return (
    <>
      <ResourceBar />
      <LogFeed />
      <ActionPanel />
    </>
  );
});

// ─── Header ───────────────────────────────────────────────────────────────────

const TerminalHeader = memo(function TerminalHeader() {
  const [time, setTime] = React.useState(() =>
    new Date().toLocaleTimeString('en-US', { hour12: false }),
  );

  useEffect(() => {
    const id = setInterval(
      () => setTime(new Date().toLocaleTimeString('en-US', { hour12: false })),
      1000,
    );
    return () => clearInterval(id);
  }, []);

  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>TERMINAL PROTOCOL</Text>
      <Text style={styles.headerMeta}>v0.1.0  {time}  UTC</Text>
    </View>
  );
});

// ─── Main screen ──────────────────────────────────────────────────────────────

function TerminalScreenComponent() {
  useGameTick();
  useEventTrigger();

  const activeTab = useGameStore(selectActiveTab);
  const addLog = useGameStore((s) => s.addLog);
  const triggerEvent = useGameStore((s) => s.triggerEvent);
  const triggeredEventIds = useGameStore((s) => s.triggeredEventIds);

  // Fire boot event once on first launch
  useEffect(() => {
    if (!triggeredEventIds.includes('boot_complete')) {
      addLog('[SYS] Terminal Protocol v0.1.0 booting...', 'system');
      addLog('[SYS] Checking subsystems...', 'system');
      addLog('[SYS] Life support: NOMINAL', 'system');
      addLog('[SYS] Navigation: OFFLINE', 'warning');
      addLog('[SYS] Comms: DEGRADED', 'warning');

      // Short delay before boot event to let logs render first
      const t = setTimeout(() => triggerEvent('boot_complete'), 800);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView style={styles.root}>
      <TerminalHeader />
      <TabBar />

      <View style={styles.content}>
        {activeTab === 'terminal' && <TerminalTabContent />}
        {activeTab === 'research' && <ResearchScreen />}
        {activeTab === 'logistics' && <LogisticsScreen />}
      </View>

      <EventModal />
      <CRTOverlay />
    </SafeAreaView>
  );
}

export const TerminalScreen = memo(TerminalScreenComponent);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  headerTitle: {
    fontFamily: fonts.mono,
    fontSize: fonts.size.sm,
    color: colors.primary,
    letterSpacing: 3,
    fontWeight: fonts.weight.bold,
  },
  headerMeta: {
    fontFamily: fonts.mono,
    fontSize: fonts.size.xxs,
    color: colors.dim,
    letterSpacing: 1,
  },
  content: {
    flex: 1,
  },
});
