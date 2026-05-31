import type { StateCreator } from 'zustand';
import type { LogEntry, LogType } from '@/types/game';
import type { GameStore } from '../index';

export interface LogsSlice {
  logs: LogEntry[];
  addLog: (message: string, type?: LogType) => void;
  clearLogs: () => void;
}

const MAX_LOG_ENTRIES = 200;

let _logCounter = 0;

export const createLogsSlice: StateCreator<
  GameStore,
  [['zustand/persist', unknown]],
  [],
  LogsSlice
> = (set) => ({
  logs: [],

  addLog: (message, type = 'system') => {
    const entry: LogEntry = {
      id: `log_${Date.now()}_${_logCounter++}`,
      timestamp: Date.now(),
      message,
      type,
    };
    set((state) => ({
      // Prepend so newest is index-0; FlashList with inverted renders newest at bottom
      logs: [entry, ...state.logs].slice(0, MAX_LOG_ENTRIES),
    }));
  },

  clearLogs: () => set({ logs: [] }),
});
