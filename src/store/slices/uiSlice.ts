import type { StateCreator } from 'zustand';
import type { TabId } from '@/types/game';
import type { GameStore } from '../index';

export interface UiSlice {
  activeTab: TabId;
  unlockedTabs: TabId[];
  actionCooldowns: Record<string, number>; // actionId -> timestamp when cooldown expires
  setActiveTab: (tab: TabId) => void;
  unlockTab: (tab: TabId) => void;
  setActionCooldown: (actionId: string, expiresAt: number) => void;
  isActionReady: (actionId: string) => boolean;
}

export const createUiSlice: StateCreator<
  GameStore,
  [['zustand/persist', unknown]],
  [],
  UiSlice
> = (set, get) => ({
  activeTab: 'terminal',
  unlockedTabs: ['terminal'],
  actionCooldowns: {},

  setActiveTab: (tab) => set({ activeTab: tab }),

  unlockTab: (tab) => {
    const { unlockedTabs } = get();
    if (unlockedTabs.includes(tab)) return;
    set({ unlockedTabs: [...unlockedTabs, tab] });
    get().addLog(`[SYS] New interface module unlocked: ${tab.toUpperCase()}.`, 'system');
  },

  setActionCooldown: (actionId, expiresAt) => {
    set((state) => ({
      actionCooldowns: { ...state.actionCooldowns, [actionId]: expiresAt },
    }));
  },

  isActionReady: (actionId) => {
    const expires = get().actionCooldowns[actionId];
    return expires === undefined || Date.now() >= expires;
  },
});
