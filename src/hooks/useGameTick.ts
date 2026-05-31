import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useGameStore } from '@/store';

const TICK_INTERVAL_MS = 1000;
/** Cap offline catch-up to 8 hours to avoid insane resource spikes */
const MAX_OFFLINE_MS = 8 * 60 * 60 * 1000;

/**
 * Core game loop. Runs a 1-second interval that advances resource production.
 * On foreground resume, applies offline catch-up based on elapsed wall time.
 */
export function useGameTick(): void {
  const lastTickRef = useRef<number>(Date.now());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Read actions once — stable references, won't cause re-render loops
  const tickResources = useGameStore((s) => s.tickResources);
  const addLog = useGameStore((s) => s.addLog);

  const tick = useRef(() => {
    const now = Date.now();
    const delta = now - lastTickRef.current;
    lastTickRef.current = now;
    tickResources(delta);
  });

  // Keep tick ref up to date without recreating interval
  useEffect(() => {
    tick.current = () => {
      const now = Date.now();
      const delta = now - lastTickRef.current;
      lastTickRef.current = now;
      tickResources(delta);
    };
  }, [tickResources]);

  useEffect(() => {
    intervalRef.current = setInterval(() => tick.current(), TICK_INTERVAL_MS);

    const handleAppState = (next: AppStateStatus) => {
      if (next === 'active') {
        const offlineMs = Math.min(Date.now() - lastTickRef.current, MAX_OFFLINE_MS);
        if (offlineMs > 5000) {
          tickResources(offlineMs);
          const mins = Math.round(offlineMs / 60000);
          addLog(`[SYS] Offline catch-up applied: ${mins}m of production.`, 'system');
        }
        lastTickRef.current = Date.now();

        if (!intervalRef.current) {
          intervalRef.current = setInterval(() => tick.current(), TICK_INTERVAL_MS);
        }
      } else if (next === 'background' || next === 'inactive') {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    };

    const sub = AppState.addEventListener('change', handleAppState);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      sub.remove();
    };
  }, [tickResources, addLog]);
}
