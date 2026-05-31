import { useEffect, useRef } from 'react';
import { useGameStore } from '@/store';

/**
 * Watches resource values and pending event queue.
 * Fires events when trigger conditions are met — runs on every store update
 * but is gated by the activeEvent check to prevent stacking.
 */
export function useEventTrigger(): void {
  const resources = useGameStore((s) => s.resources);
  const eventCatalog = useGameStore((s) => s.eventCatalog);
  const triggeredEventIds = useGameStore((s) => s.triggeredEventIds);
  const pendingEventIds = useGameStore((s) => s.pendingEventIds);
  const activeEvent = useGameStore((s) => s.activeEvent);
  const triggerEvent = useGameStore((s) => s.triggerEvent);

  // Debounce: don't check more often than every 500ms
  const lastCheckRef = useRef<number>(0);

  useEffect(() => {
    if (activeEvent) return;

    const now = Date.now();
    if (now - lastCheckRef.current < 500) return;
    lastCheckRef.current = now;

    // Priority 1: pending queue (unlocked by previous choices)
    if (pendingEventIds.length > 0) {
      const nextId = pendingEventIds[0];
      if (nextId) triggerEvent(nextId);
      return;
    }

    // Priority 2: resource-threshold events
    for (const event of eventCatalog) {
      if (event.trigger.kind !== 'resource') continue;
      if (!event.repeatable && triggeredEventIds.includes(event.id)) continue;

      const { resource, threshold, condition } = event.trigger;
      const current = resources[resource]?.current ?? 0;

      const shouldFire =
        condition === 'above' ? current >= threshold : current <= threshold;

      if (shouldFire) {
        triggerEvent(event.id);
        return; // one event at a time
      }
    }
  }, [resources, activeEvent, pendingEventIds, eventCatalog, triggeredEventIds, triggerEvent]);
}
