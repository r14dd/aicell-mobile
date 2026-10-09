import { useSyncExternalStore } from 'react';

export type LayaUi = {
  /** A plan is being carried out. */
  busy: boolean;
  /** What Laya is saying right now. */
  caption: string | null;
  /** Pointer position in window coordinates, null when hidden. */
  cursor: { x: number; y: number } | null;
  pressing: boolean;
  /** Sheets are separate windows: while one is open it hosts the bubble and the root copy hides. */
  host: 'root' | 'sheet';
  /** Top of the docked bot, shared so a sheet's copy appears exactly where the root one was. */
  bubbleY: number | null;
  /** Why the last purchase Laya started failed, for the narration. */
  error: string | null;
};

let state: LayaUi = { busy: false, caption: null, cursor: null, pressing: false, host: 'root', bubbleY: null, error: null };
const listeners = new Set<() => void>();

export const getLayaUi = () => state;

export function setLayaUi(patch: Partial<LayaUi>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export const useLayaUi = () => useSyncExternalStore(subscribe, getLayaUi, getLayaUi);

// Screens report outcomes Laya has to wait for (payment done, identity check failed).
type Waiter = { names: string[]; resolve: (name: string | null) => void; timer: ReturnType<typeof setTimeout> };
const waiters = new Set<Waiter>();

export function signal(name: string) {
  for (const w of [...waiters]) {
    if (!w.names.includes(name)) continue;
    waiters.delete(w);
    clearTimeout(w.timer);
    w.resolve(name);
  }
}

/** Resolves with the first of `names` that fires, or null after `timeoutMs`. */
export function waitForSignal(names: string[], timeoutMs: number) {
  return new Promise<string | null>((resolve) => {
    const w: Waiter = {
      names,
      resolve,
      timer: setTimeout(() => {
        waiters.delete(w);
        resolve(null);
      }, timeoutMs),
    };
    waiters.add(w);
  });
}
