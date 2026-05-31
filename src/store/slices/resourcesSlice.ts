import type { StateCreator } from 'zustand';
import type { ResourceDelta, ResourceKey, ResourceMap } from '@/types/game';
import type { GameStore } from '../index';

export interface ResourcesSlice {
  resources: ResourceMap;
  /** Apply accumulated perTick production over deltaMs milliseconds */
  tickResources: (deltaMs: number) => void;
  /** Instantly apply a resource delta (from events, actions) */
  applyDelta: (delta: ResourceDelta) => void;
  /** Recalculate perTick rates from all owned modules */
  recalcTickRates: () => void;
}

const INITIAL_RESOURCES: ResourceMap = {
  oxygen: { current: 75, max: 100, perTick: 0 },
  energy: { current: 60, max: 100, perTick: 0 },
  data:   { current: 0,  max: 100, perTick: 0 },
  hull:   { current: 80, max: 100, perTick: 0 },
};

export const createResourcesSlice: StateCreator<
  GameStore,
  [['zustand/persist', unknown]],
  [],
  ResourcesSlice
> = (set, get) => ({
  resources: INITIAL_RESOURCES,

  tickResources: (deltaMs) => {
    const deltaS = deltaMs / 1000;
    set((state) => {
      const next = { ...state.resources };
      for (const key of Object.keys(next) as ResourceKey[]) {
        const r = next[key]!;
        next[key] = {
          ...r,
          current: Math.min(r.max, Math.max(0, r.current + r.perTick * deltaS)),
        };
      }
      return { resources: next };
    });
  },

  applyDelta: (delta) => {
    set((state) => {
      const next = { ...state.resources };
      for (const [k, amount] of Object.entries(delta) as [ResourceKey, number][]) {
        const r = next[k]!;
        next[k] = {
          ...r,
          current: Math.min(r.max, Math.max(0, r.current + amount)),
        };
      }
      return { resources: next };
    });
  },

  recalcTickRates: () => {
    const { ownedModules, moduleDefinitions } = get();
    const rates: ResourceDelta = {};

    for (const owned of ownedModules) {
      const def = moduleDefinitions.find((m) => m.id === owned.moduleId);
      if (!def) continue;
      for (const [k, v] of Object.entries(def.tickBonus) as [ResourceKey, number][]) {
        rates[k] = (rates[k] ?? 0) + v * owned.count;
      }
    }

    set((state) => {
      const next = { ...state.resources };
      for (const key of Object.keys(next) as ResourceKey[]) {
        next[key] = { ...next[key]!, perTick: rates[key] ?? 0 };
      }
      return { resources: next };
    });
  },
});
