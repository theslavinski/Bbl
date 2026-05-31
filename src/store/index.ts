import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from './mmkv';
import { createResourcesSlice, type ResourcesSlice } from './slices/resourcesSlice';
import { createLogsSlice, type LogsSlice } from './slices/logsSlice';
import { createEventsSlice, type EventsSlice } from './slices/eventsSlice';
import { createModulesSlice, type ModulesSlice } from './slices/modulesSlice';
import { createUiSlice, type UiSlice } from './slices/uiSlice';

// The full store type — imported by slice files for cross-slice action calls.
export type GameStore = ResourcesSlice & LogsSlice & EventsSlice & ModulesSlice & UiSlice;

// ─── Persisted subset ─────────────────────────────────────────────────────────
// Logs and activeEvent are transient; never persist them.
type PersistedState = Pick<
  GameStore,
  | 'resources'
  | 'ownedModules'
  | 'triggeredEventIds'
  | 'pendingEventIds'
  | 'activeTab'
  | 'unlockedTabs'
  | 'actionCooldowns'
>;

// ─── Store ────────────────────────────────────────────────────────────────────

export const useGameStore = create<GameStore>()(
  persist(
    (...args) => ({
      ...createResourcesSlice(...args),
      ...createLogsSlice(...args),
      ...createEventsSlice(...args),
      ...createModulesSlice(...args),
      ...createUiSlice(...args),
    }),
    {
      name: 'tp-save-v1',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state): PersistedState => ({
        resources: state.resources,
        ownedModules: state.ownedModules,
        triggeredEventIds: state.triggeredEventIds,
        pendingEventIds: state.pendingEventIds,
        activeTab: state.activeTab,
        unlockedTabs: state.unlockedTabs,
        actionCooldowns: state.actionCooldowns,
      }),
    },
  ),
);

// ─── Typed selectors (stable references for React.memo / useCallback) ─────────

export const selectResources = (s: GameStore) => s.resources;
export const selectLogs = (s: GameStore) => s.logs;
export const selectActiveEvent = (s: GameStore) => s.activeEvent;
export const selectActiveTab = (s: GameStore) => s.activeTab;
export const selectUnlockedTabs = (s: GameStore) => s.unlockedTabs;
export const selectOwnedModules = (s: GameStore) => s.ownedModules;
export const selectModuleDefinitions = (s: GameStore) => s.moduleDefinitions;
