import { Platform } from 'react-native';
import type { StateStorage } from 'zustand/middleware';

// On web: use localStorage (synchronous, same API surface as MMKV).
// On native: use MMKV via JSI for zero-latency persistence.
function buildStorage(): StateStorage {
  if (Platform.OS === 'web') {
    return {
      getItem: (name) => {
        try { return localStorage.getItem(name); } catch { return null; }
      },
      setItem: (name, value) => {
        try { localStorage.setItem(name, value); } catch { /* quota */ }
      },
      removeItem: (name) => {
        try { localStorage.removeItem(name); } catch { /* noop */ }
      },
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { MMKV } = require('react-native-mmkv') as typeof import('react-native-mmkv');
  const storage = new MMKV({ id: 'terminal-protocol' });
  return {
    getItem: (name) => storage.getString(name) ?? null,
    setItem: (name, value) => storage.set(name, value),
    removeItem: (name) => storage.delete(name),
  };
}

export const mmkvStorage: StateStorage = buildStorage();

