import type { MoneyResponse } from '@/api/billing';
import { api, dayMonth, num } from '@/api/client';

type ApiSteam = {
  chips: string[];
  limits: { min: string; max: string };
  results: { id: number; name: string; last_amount: string | null; last_topped_at: string | null }[];
};
export type SteamAccount = { id: string; name: string; lastAmount: number | null; lastDate: string | null };
export type SteamInfo = { accounts: SteamAccount[]; chips: readonly number[]; limits: { min: number; max: number } };
export type SteamTopUpResponse = MoneyResponse & { steam_top_up: { account: string; amount: string; id: number } };

/** Most recently topped-up account first, as the list always showed it. */
const toSteam = (r: ApiSteam): SteamInfo => ({
  accounts: [...r.results]
    .sort((a, b) => (b.last_topped_at ?? '').localeCompare(a.last_topped_at ?? ''))
    .map((a) => ({
      id: String(a.id),
      name: a.name,
      lastAmount: a.last_amount === null ? null : num(a.last_amount),
      lastDate: a.last_topped_at ? dayMonth(a.last_topped_at) : null,
    })),
  chips: r.chips.map(num),
  limits: { min: num(r.limits.min), max: num(r.limits.max) },
});

export const getSteam = () => api<ApiSteam>('billing/steam/accounts/').then(toSteam);
export const topUpSteam = (body: { account: string; amount: string; save: boolean }, key?: string) =>
  api<SteamTopUpResponse>('billing/steam/top-up/', { method: 'POST', body, money: true, key });
