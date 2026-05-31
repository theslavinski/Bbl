import type { StateCreator } from 'zustand';
import type { ModuleDefinition, OwnedModule } from '@/types/game';
import type { GameStore } from '../index';

export interface ModulesSlice {
  moduleDefinitions: ModuleDefinition[];
  ownedModules: OwnedModule[];
  purchaseModule: (moduleId: string) => boolean;
}

const MODULE_CATALOG: ModuleDefinition[] = [
  {
    id: 'o2_recycler',
    name: 'O2 Recycler Mk.I',
    description: 'Electrolyzes water reserves. +1.5 O2/s',
    cost: { data: 20, energy: 10 },
    tickBonus: { oxygen: 1.5 },
    maxOwned: 5,
  },
  {
    id: 'solar_array',
    name: 'Solar Collector Array',
    description: 'Deploys micro-panels. +2 Energy/s',
    cost: { data: 30, oxygen: 5 },
    tickBonus: { energy: 2 },
    maxOwned: 4,
  },
  {
    id: 'data_relay',
    name: 'Passive Data Relay',
    description: 'Intercepts ambient signals. +1 Data/s',
    cost: { energy: 15 },
    tickBonus: { data: 1 },
    maxOwned: 6,
  },
  {
    id: 'hull_nano',
    name: 'Nano-Repair Lattice',
    description: 'Self-healing hull coating. +0.5 Hull/s',
    cost: { data: 50, energy: 20 },
    tickBonus: { hull: 0.5 },
    maxOwned: 3,
  },
  {
    id: 'fusion_tap',
    name: 'Micro-Fusion Tap',
    description: 'Taps reactor bleed. +5 Energy/s',
    cost: { data: 80, hull: 10 },
    tickBonus: { energy: 5 },
    maxOwned: 2,
  },
];

export const createModulesSlice: StateCreator<
  GameStore,
  [['zustand/persist', unknown]],
  [],
  ModulesSlice
> = (set, get) => ({
  moduleDefinitions: MODULE_CATALOG,
  ownedModules: [],

  purchaseModule: (moduleId) => {
    const { moduleDefinitions, ownedModules, resources } = get();
    const def = moduleDefinitions.find((m) => m.id === moduleId);
    if (!def) return false;

    const currentOwned = ownedModules.find((o) => o.moduleId === moduleId)?.count ?? 0;
    if (def.maxOwned !== undefined && currentOwned >= def.maxOwned) {
      get().addLog(`[SYS] ${def.name}: acquisition limit reached.`, 'warning');
      return false;
    }

    // Validate cost
    for (const [k, cost] of Object.entries(def.cost) as [keyof typeof resources, number][]) {
      if ((resources[k]?.current ?? 0) < cost) {
        get().addLog(`[SYS] Insufficient ${k.toUpperCase()} for ${def.name}.`, 'warning');
        return false;
      }
    }

    // Deduct cost
    const negativeCost: import('@/types/game').ResourceDelta = Object.fromEntries(
      Object.entries(def.cost).map(([k, v]) => [k, -(v as number)]),
    );
    get().applyDelta(negativeCost);

    // Add to owned
    const nextOwned = [...ownedModules];
    const idx = nextOwned.findIndex((o) => o.moduleId === moduleId);
    if (idx >= 0) {
      nextOwned[idx] = { moduleId, count: currentOwned + 1 };
    } else {
      nextOwned.push({ moduleId, count: 1 });
    }
    set({ ownedModules: nextOwned });

    get().recalcTickRates();
    get().addLog(`[MOD] ${def.name} installed.`, 'action');
    return true;
  },
});
