import { MMKV } from 'react-native-mmkv';
import type { StateStorage } from 'zustand/middleware';

const storage = new MMKV({ id: 'terminal-protocol' });

/**
 * Synchronous MMKV adapter for Zustand persist middleware.
 * MMKV reads/writes are O(1) on the JSI thread — no async bridge overhead.
 */
export const mmkvStorage: StateStorage = {
  getItem: (name: string): string | null => storage.getString(name) ?? null,
  setItem: (name: string, value: string): void => storage.set(name, value),
  removeItem: (name: string): void => storage.delete(name),
};
