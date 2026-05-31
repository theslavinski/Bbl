import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FlashList, type ListRenderItemInfo } from '@shopify/flash-list';
import { useGameStore, selectLogs } from '@/store';
import { colors, fonts, logTypeColor, spacing } from '@/theme/terminal';
import type { LogEntry } from '@/types/game';

// ─── Single log row ───────────────────────────────────────────────────────────

interface LogRowProps {
  item: LogEntry;
}

const LogRow = memo(function LogRow({ item }: LogRowProps) {
  const timeStr = new Date(item.timestamp).toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const textColor = logTypeColor[item.type] ?? colors.textNormal;

  return (
    <View style={styles.row}>
      <Text style={styles.timestamp}>{timeStr}</Text>
      <Text style={[styles.message, { color: textColor }]} selectable>
        {item.message}
      </Text>
    </View>
  );
});

// ─── Feed ─────────────────────────────────────────────────────────────────────

function LogFeedComponent() {
  const logs = useGameStore(selectLogs);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<LogEntry>) => <LogRow item={item} />,
    [],
  );

  const keyExtractor = useCallback((item: LogEntry) => item.id, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>── SYSTEM LOG ──────────────────────</Text>
      <FlashList
        data={logs}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        estimatedItemSize={36}
        inverted
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

export const LogFeed = memo(LogFeedComponent);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  header: {
    fontFamily: fonts.mono,
    fontSize: fonts.size.xxs,
    color: colors.dim,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xxs,
    letterSpacing: 1,
  },
  listContent: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: spacing.xxs,
    gap: spacing.sm,
  },
  timestamp: {
    fontFamily: fonts.mono,
    fontSize: fonts.size.xxs,
    color: colors.muted,
    minWidth: 70,
  },
  message: {
    fontFamily: fonts.mono,
    fontSize: fonts.size.sm,
    flex: 1,
    lineHeight: 18,
  },
});
