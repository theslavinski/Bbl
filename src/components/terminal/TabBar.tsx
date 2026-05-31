import React, { memo, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useGameStore, selectActiveTab, selectUnlockedTabs } from '@/store';
import { colors, fonts, spacing } from '@/theme/terminal';
import type { TabDefinition, TabId } from '@/types/game';

const TABS: TabDefinition[] = [
  { id: 'terminal',  label: 'TERMINAL' },
  { id: 'research',  label: 'RESEARCH',  unlockAt: 1 },
  { id: 'logistics', label: 'LOGISTICS', unlockAt: 2 },
];

interface TabButtonProps {
  tab: TabDefinition;
  isActive: boolean;
  isUnlocked: boolean;
  onPress: (id: TabId) => void;
}

const TabButton = memo(function TabButton({ tab, isActive, isUnlocked, onPress }: TabButtonProps) {
  const handlePress = useCallback(() => {
    if (isUnlocked) onPress(tab.id);
  }, [tab.id, isUnlocked, onPress]);

  return (
    <Pressable
      onPress={handlePress}
      disabled={!isUnlocked}
      style={[
        styles.tab,
        isActive && styles.tabActive,
        !isUnlocked && styles.tabLocked,
      ]}
    >
      <Text
        style={[
          styles.tabLabel,
          isActive && styles.tabLabelActive,
          !isUnlocked && styles.tabLabelLocked,
        ]}
      >
        {isUnlocked ? tab.label : `[${tab.label}]`}
      </Text>
      {isActive && <View style={styles.activeIndicator} />}
    </Pressable>
  );
});

function TabBarComponent() {
  const activeTab = useGameStore(selectActiveTab);
  const unlockedTabs = useGameStore(selectUnlockedTabs);
  const setActiveTab = useGameStore((s) => s.setActiveTab);

  return (
    <View style={styles.container}>
      {TABS.map((tab) => (
        <TabButton
          key={tab.id}
          tab={tab}
          isActive={activeTab === tab.id}
          isUnlocked={unlockedTabs.includes(tab.id)}
          onPress={setActiveTab}
        />
      ))}
    </View>
  );
}

export const TabBar = memo(TabBarComponent);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.bg,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    position: 'relative',
  },
  tabActive: {
    backgroundColor: colors.surface,
  },
  tabLocked: {
    opacity: 0.3,
  },
  tabLabel: {
    fontFamily: fonts.mono,
    fontSize: fonts.size.xs,
    color: colors.dim,
    letterSpacing: 2,
  },
  tabLabelActive: {
    color: colors.primary,
  },
  tabLabelLocked: {
    color: colors.muted,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '10%',
    right: '10%',
    height: 2,
    backgroundColor: colors.primary,
  },
});
