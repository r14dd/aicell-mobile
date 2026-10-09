import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react';

import { ApiError } from '@/api/client';

type Entry<T> = { data?: T; error: ApiError | null; loading: boolean; fetchedAt: number; promise?: Promise<T> };

const entries = new Map<string, Entry<unknown>>();
const listeners = new Map<string, Set<() => void>>();
const fetchers = new Map<string, () => Promise<unknown>>();
const STALE_MS = 15000;

function emit(key: string) {
  listeners.get(key)?.forEach((l) => l());
}

function entry<T>(key: string): Entry<T> {
  let e = entries.get(key) as Entry<T> | undefined;
  if (!e) {
    e = { error: null, loading: false, fetchedAt: 0 };
    entries.set(key, e);
  }
  return e;
}

export function getQueryData<T>(key: string) {
  return entries.get(key)?.data as T | undefined;
}

/** Writes data the app already holds (a money response, a PATCH echo) so screens update at once. */
export function setQueryData<T>(key: string, data: T) {
  const e = entry<T>(key);
  entries.set(key, { ...e, data, error: null, loading: false, fetchedAt: Date.now() });
  emit(key);
}

/** Marks keys starting with `prefix` stale and refetches the ones a mounted screen is watching. */
export function invalidate(prefix: string) {
  for (const key of entries.keys()) {
    if (!key.startsWith(prefix)) continue;
    entries.set(key, { ...entry(key), fetchedAt: 0 });
    const fetcher = fetchers.get(key);
    if (fetcher && listeners.get(key)?.size) void fetchQuery(key, fetcher).catch(() => {});
  }
}

/** Fetches `key` once even when several screens ask at the same time. */
export function fetchQuery<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const e = entry<T>(key);
  if (e.promise) return e.promise;
  const promise = fetcher()
    .then((data) => {
      entries.set(key, { data, error: null, loading: false, fetchedAt: Date.now() });
      emit(key);
      return data;
    })
    .catch((err: unknown) => {
      const error = err instanceof ApiError ? err : new ApiError(0, 'network', 'No connection to the server');
      entries.set(key, { ...entry<T>(key), error, loading: false, fetchedAt: Date.now(), promise: undefined });
      emit(key);
      throw error;
    });
  entries.set(key, { ...e, loading: true, promise });
  emit(key);
  return promise;
}

/**
 * Reads `key` from the cache and (re)fetches it when it is missing or older than 15 s.
 * `seed` renders before the first answer arrives and stays when the server cannot be reached.
 */
export function useQuery<T>(key: string | null, fetcher: () => Promise<T>, seed?: T) {
  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  const subscribe = useCallback(
    (listener: () => void) => {
      if (!key) return () => {};
      let set = listeners.get(key);
      if (!set) {
        set = new Set();
        listeners.set(key, set);
      }
      set.add(listener);
      return () => {
        set.delete(listener);
      };
    },
    [key],
  );
  const snapshot = useCallback(() => (key ? (entries.get(key) as Entry<T> | undefined) : undefined), [key]);
  const state = useSyncExternalStore(subscribe, snapshot, snapshot);

  useEffect(() => {
    if (!key) return;
    const run = () => fetcherRef.current();
    fetchers.set(key, run);
    const e = entries.get(key);
    if (!e || (!e.promise && Date.now() - e.fetchedAt > STALE_MS)) void fetchQuery(key, run).catch(() => {});
  }, [key]);

  const refresh = useCallback(() => (key ? fetchQuery(key, () => fetcherRef.current()).then(() => undefined, () => undefined) : Promise.resolve()), [key]);

  return {
    data: (state?.data ?? seed) as T | undefined,
    /** True until the first answer; the seed is showing. */
    stale: state?.data === undefined,
    loading: !!state?.loading,
    error: state?.error ?? null,
    refresh,
  };
}
