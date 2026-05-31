import React, { memo, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, Modal } from 'react-native';
import { useGameStore, selectActiveEvent } from '@/store';
import { colors, fonts, spacing, radius } from '@/theme/terminal';
import type { EventChoice } from '@/types/game';

// ─── Choice button ────────────────────────────────────────────────────────────

interface ChoiceButtonProps {
  choice: EventChoice;
  onPress: (id: string) => void;
}

const ChoiceButton = memo(function ChoiceButton({ choice, onPress }: ChoiceButtonProps) {
  const handlePress = useCallback(() => onPress(choice.id), [choice.id, onPress]);

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [styles.choiceBtn, pressed && styles.choiceBtnPressed]}
    >
      <Text style={styles.choiceText}>{choice.text}</Text>
    </Pressable>
  );
});

// ─── Modal ────────────────────────────────────────────────────────────────────

function EventModalComponent() {
  const event = useGameStore(selectActiveEvent);
  const resolveEvent = useGameStore((s) => s.resolveEvent);

  const handleChoice = useCallback(
    (choiceId: string) => resolveEvent(choiceId),
    [resolveEvent],
  );

  if (!event) return null;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={!!event}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <View style={styles.panel}>
          {/* Title bar */}
          <View style={styles.titleBar}>
            <Text style={styles.titleBarText}>! INTERRUPT !</Text>
            <Text style={styles.titleBarId}>#{event.id.toUpperCase()}</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>{event.title}</Text>

          {/* Separator */}
          <Text style={styles.sep}>{'─'.repeat(36)}</Text>

          {/* Description */}
          <Text style={styles.description}>{event.description}</Text>

          <Text style={styles.sep}>{'─'.repeat(36)}</Text>

          {/* Choices */}
          <View style={styles.choices}>
            {event.choices.map((c) => (
              <ChoiceButton key={c.id} choice={c} onPress={handleChoice} />
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

export const EventModal = memo(EventModalComponent);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.82)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  panel: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  titleBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  titleBarText: {
    fontFamily: fonts.mono,
    fontSize: fonts.size.xxs,
    color: colors.accent,
    letterSpacing: 2,
  },
  titleBarId: {
    fontFamily: fonts.mono,
    fontSize: fonts.size.xxs,
    color: colors.dim,
  },
  title: {
    fontFamily: fonts.mono,
    fontSize: fonts.size.lg,
    color: colors.textBright,
    letterSpacing: 3,
    marginBottom: spacing.xs,
  },
  sep: {
    fontFamily: fonts.mono,
    fontSize: fonts.size.xxs,
    color: colors.borderDim,
    marginVertical: spacing.xs,
  },
  description: {
    fontFamily: fonts.mono,
    fontSize: fonts.size.sm,
    color: colors.secondary,
    lineHeight: 20,
  },
  choices: {
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  choiceBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.sm,
    backgroundColor: colors.bg,
  },
  choiceBtnPressed: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.accent,
  },
  choiceText: {
    fontFamily: fonts.mono,
    fontSize: fonts.size.sm,
    color: colors.primary,
  },
});
