import type { StateCreator } from 'zustand';
import type { GameEvent } from '@/types/game';
import eventsData from '@/data/events.json';
import type { GameStore } from '../index';

export interface EventsSlice {
  eventCatalog: GameEvent[];
  activeEvent: GameEvent | null;
  triggeredEventIds: string[];
  pendingEventIds: string[];
  triggerEvent: (eventId: string) => void;
  resolveEvent: (choiceId: string) => void;
  queueEvent: (eventId: string) => void;
}

export const createEventsSlice: StateCreator<
  GameStore,
  [['zustand/persist', unknown]],
  [],
  EventsSlice
> = (set, get) => ({
  eventCatalog: eventsData.events as GameEvent[],
  activeEvent: null,
  triggeredEventIds: [],
  pendingEventIds: [],

  triggerEvent: (eventId) => {
    const { eventCatalog, triggeredEventIds, activeEvent } = get();
    if (activeEvent) return; // one event at a time

    const event = eventCatalog.find((e) => e.id === eventId);
    if (!event) return;
    if (!event.repeatable && triggeredEventIds.includes(eventId)) return;

    get().addLog(`[EVENT] ${event.title}`, 'event');
    set({ activeEvent: event });
  },

  resolveEvent: (choiceId) => {
    const { activeEvent, eventCatalog } = get();
    if (!activeEvent) return;

    const choice = activeEvent.choices.find((c) => c.id === choiceId);
    if (!choice) return;

    get().applyDelta(choice.effects);
    get().addLog(choice.log, 'event');

    const nowTriggered = activeEvent.repeatable
      ? get().triggeredEventIds
      : [...get().triggeredEventIds, activeEvent.id];

    // Remove resolved event from pending queue, then append unlocked events
    const newPending = get().pendingEventIds.filter((id) => id !== activeEvent.id);
    for (const unlockId of choice.unlocks ?? []) {
      if (eventCatalog.find((e) => e.id === unlockId) && !newPending.includes(unlockId)) {
        newPending.push(unlockId);
      }
    }

    set({
      activeEvent: null,
      triggeredEventIds: nowTriggered,
      pendingEventIds: newPending,
    });

    // Immediately surface next pending event (after a short delay handled by hook)
  },

  queueEvent: (eventId) => {
    set((state) => ({
      pendingEventIds: state.pendingEventIds.includes(eventId)
        ? state.pendingEventIds
        : [...state.pendingEventIds, eventId],
    }));
  },
});
