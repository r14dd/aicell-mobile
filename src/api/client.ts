import { Platform } from 'react-native';

export type Lang = 'az' | 'en';

/**
 * Base URL of the white-collar backend, always ending in `/api/`. Override with EXPO_PUBLIC_API_URL.
 * 127.0.0.1 rather than localhost: Django's runserver binds IPv4, and localhost resolves to ::1 first.
 */
export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'http://127.0.0.1:8010/api/').replace(/\/*$/, '/');
const TOKEN = process.env.EXPO_PUBLIC_API_TOKEN;
let token: string | undefined = TOKEN;
let refresh: string | undefined;
/** Tokens from `users/otp/verify/`; none falls back to the server's demo subscriber (DEMO_AUTH). */
export const setApiTokens = (next?: { access: string; refresh?: string }) => {
  token = next?.access;
  refresh = next?.refresh;
};

/** An expired access token is exchanged once; a dead refresh token signs the app out of the server. */
async function renewToken() {
  if (!refresh) return false;
  try {
    const res = await fetch(`${API_URL}users/token/refresh/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh }) });
    if (!res.ok) throw new Error(String(res.status));
    token = ((await res.json()) as { access: string }).access;
    return true;
  } catch {
    token = undefined;
    refresh = undefined;
    return false;
  }
}

export const APP_VERSION = '5.1.0 (13557)';

let language: Lang = 'en';
/** Language sent as `Accept-Language`; the app copy is English, so catalogue texts match it. */
export const setApiLanguage = (lang: Lang) => {
  language = lang;
};

/** Every non-2xx answer, plus network failures (status 0, code `network`). */
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    public detail: string,
    public errors?: Record<string, string[]>,
    public retryAfter?: number,
    /** The whole error body, for fields a few endpoints add (`attempts_left`). */
    public body?: Record<string, unknown>,
  ) {
    super(detail);
    this.name = 'ApiError';
  }
}

export const isNotImplemented = (e: unknown): e is ApiError => e instanceof ApiError && e.status === 501;
export const isInsufficient = (e: unknown): e is ApiError => e instanceof ApiError && e.status === 402;
export const errorMessage = (e: unknown) => (e instanceof ApiError ? e.detail : 'Something went wrong');

/** UUID v4 for `Idempotency-Key`: one per user attempt, reused on a retry of the same attempt. */
export function newIdempotencyKey() {
  const hex = '0123456789abcdef';
  let out = '';
  for (let i = 0; i < 36; i += 1) {
    if (i === 8 || i === 13 || i === 18 || i === 23) out += '-';
    else if (i === 14) out += '4';
    else if (i === 19) out += hex[8 + Math.floor(Math.random() * 4)];
    else out += hex[Math.floor(Math.random() * 16)];
  }
  return out;
}

export type ApiInit = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** Balance-changing POST: sends `Idempotency-Key` (`key` to retry the same attempt). */
  money?: boolean;
  key?: string;
  lang?: Lang;
  timeoutMs?: number;
  accept?: string;
  /** Multipart upload instead of a JSON body (the recorded question). */
  form?: FormData;
  /** Set on the one retry after a token refresh. */
  retried?: boolean;
};

/** The headers every request carries, for uploads that bypass `fetch` (native multipart). */
export function apiHeaders(): Record<string, string> {
  const headers: Record<string, string> = { Accept: 'application/json', 'Accept-Language': language, 'X-App-Version': APP_VERSION, 'X-Platform': Platform.OS === 'ios' || Platform.OS === 'android' ? Platform.OS : 'web' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

/** Calls `<API_URL><path>`; `path` is relative (`billing/balance/`) and keeps its trailing slash. */
export async function api<T>(path: string, init: ApiInit = {}): Promise<T> {
  const url = API_URL + path.replace(/^\//, '');
  const headers: Record<string, string> = {
    Accept: init.accept ?? 'application/json',
    'Accept-Language': init.lang ?? language,
    'X-App-Version': APP_VERSION,
    'X-Platform': Platform.OS === 'ios' || Platform.OS === 'android' ? Platform.OS : 'web',
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (init.body !== undefined && !init.form) headers['Content-Type'] = 'application/json';
  if (init.money) headers['Idempotency-Key'] = init.key ?? newIdempotencyKey();

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), init.timeoutMs ?? 15000);
  try {
    const res = await fetch(url, {
      method: init.method ?? 'GET',
      headers,
      body: init.form ?? (init.body === undefined ? undefined : JSON.stringify(init.body)),
      signal: controller.signal,
    });
    const text = await res.text();
    let data: unknown = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }
    if (!res.ok) {
      const body = (data ?? {}) as { code?: string; detail?: string; errors?: Record<string, string[]> };
      if (res.status === 401 && body.code === 'token_expired' && !init.retried && (await renewToken())) return api<T>(path, { ...init, retried: true });
      const retry = Number(res.headers.get('Retry-After'));
      throw new ApiError(res.status, body.code ?? 'http_error', body.detail ?? `Request failed (${res.status})`, body.errors, Number.isFinite(retry) && retry > 0 ? retry : undefined, body as Record<string, unknown>);
    }
    return data as T;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    const aborted = e instanceof Error && e.name === 'AbortError';
    throw new ApiError(0, 'network', aborted ? 'The server took too long to respond' : 'No connection to the server');
  } finally {
    clearTimeout(timer);
  }
}

/** Money and other numeric strings (`"16.21"`) as numbers. */
export const num = (value: string | number | null | undefined) => (value === null || value === undefined || value === '' ? 0 : Number(value));

/** `2026-10-02T12:39:00Z` → `02 October` (local time). */
export function dayMonth(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'long' });
}

/** `2026-10-02T12:39:00Z` → `02 October 2026`. */
export function longDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
}

/** `2026-10-02T12:39:00Z` → `16:39` (local time). */
export function clock(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}
