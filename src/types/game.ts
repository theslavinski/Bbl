// ─── Resource System ─────────────────────────────────────────────────────────

export type ResourceKey = 'oxygen' | 'energy' | 'data' | 'hull';

export interface Resource {
  current: number;
  max: number;
  /** Auto-production per second from installed modules */
  perTick: number;
}

export type ResourceMap = Record<ResourceKey, Resource>;

export type ResourceDelta = Partial<Record<ResourceKey, number>>;

// ─── Log System ───────────────────────────────────────────────────────────────

export type LogType = 'system' | 'warning' | 'error' | 'event' | 'action';

export interface LogEntry {
  id: string;
  timestamp: number;
  message: string;
  type: LogType;
}

// ─── Event System ─────────────────────────────────────────────────────────────

export type EventTrigger =
  | { kind: 'resource'; resource: ResourceKey; threshold: number; condition: 'above' | 'below' }
  | { kind: 'manual' };

export interface EventChoice {
  id: string;
  text: string;
  effects: ResourceDelta;
  /** IDs of events to unlock/queue after this choice */
  unlocks?: string[];
  log: string;
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  trigger: EventTrigger;
  choices: EventChoice[];
  repeatable?: boolean;
}

// ─── Module System ────────────────────────────────────────────────────────────

export interface ModuleDefinition {
  id: string;
  name: string;
  description: string;
  cost: ResourceDelta;
  /** perTick bonus added to resources when module is owned */
  tickBonus: ResourceDelta;
  /** max number of this module that can be owned; undefined = unlimited */
  maxOwned?: number;
}

export interface OwnedModule {
  moduleId: string;
  count: number;
}

// ─── Actions ─────────────────────────────────────────────────────────────────

export interface ActionDefinition {
  id: string;
  label: string;
  /** Cooldown in milliseconds */
  cooldown: number;
  effects: ResourceDelta;
  log: string;
}

// ─── UI / Navigation ─────────────────────────────────────────────────────────

export type TabId = 'terminal' | 'research' | 'logistics';

export interface TabDefinition {
  id: TabId;
  label: string;
  /** Minimum total resources accumulated before tab unlocks */
  unlockAt?: number;
}
