import { api, clock, dayMonth, longDate, num } from '@/api/client';
import type { Transaction } from '@/data/mock';
import type { TopUp } from '@/data/topUps';

export type Balance = { balance: string; currency: 'AZN'; month: string; top_ups_this_month: string };
export type ApiTransaction = { id: number; kind: 'top_up' | 'purchase' | 'payment' | 'credit'; title: string; amount: string; created_at: string };
export type ApiTopUp = { id: number; amount: string; created_at: string; method: 'card' | 'akart' | 'google_pay'; status?: string };
export type Page<T> = { results: T[]; next: string | null };
/** Shape shared by every balance-changing answer. */
export type MoneyResponse = { balance: string; transaction?: { id: number; title: string; amount: string } };
export type TopUpResponse = MoneyResponse & { top_up: ApiTopUp; saved_akart?: { id: number; msisdn: string } | null };
export type TopUpMethods = {
  banner: { image: string; alt: string; deep_link: string | null };
  methods: { key: 'card' | 'akart' | 'voucher' | 'kredit'; label: string; deep_link: string | null }[];
  google_pay: { available: boolean; min: string; max: string; note: string };
};
export type SavedCard = { id: number; brand: string; last4: string; expiry: string; is_default: boolean };

export const getBalance = () => api<Balance>('billing/balance/');
export const getTransactions = (limit = 20) => api<Page<ApiTransaction>>(`billing/transactions/?limit=${limit}`);
export const getTopUps = (range?: { from?: string; to?: string }, limit = 100) => {
  const q = new URLSearchParams({ limit: String(limit) });
  if (range?.from) q.set('from', range.from);
  if (range?.to) q.set('to', range.to);
  return api<Page<ApiTopUp>>(`billing/top-ups/?${q.toString()}`);
};
export const getTopUpMethods = () => api<TopUpMethods>('billing/top-up/methods/');
export const getCards = () => api<{ results: SavedCard[] }>('billing/cards/');

export const topUpCard = (body: { card_bin: string; amount: string }, key?: string) => api<TopUpResponse>('billing/top-up/card/', { method: 'POST', body, money: true, key });
export const topUpAkart = (body: { akart_msisdn: string; amount: string; save?: boolean }, key?: string) => api<TopUpResponse>('billing/top-up/akart/', { method: 'POST', body, money: true, key });
export const topUpVoucher = (body: { code: string }, key?: string) => api<TopUpResponse>('billing/top-up/voucher/', { method: 'POST', body, money: true, key });
export const topUpGooglePay = (body: { amount: string; payment_token: 'simulated'; card_last4?: string }, key?: string) => api<TopUpResponse>('billing/top-up/google-pay/', { method: 'POST', body, money: true, key });

/** API transaction → the shape the Home and Payments lists render. */
export const toTransaction = (t: ApiTransaction): Transaction => ({ id: String(t.id), title: t.title, date: dayMonth(t.created_at), amount: num(t.amount) });
/** API top-up → the shape the Top-ups history renders. */
export const toTopUp = (t: ApiTopUp): TopUp => ({ id: String(t.id), date: longDate(t.created_at), time: clock(t.created_at), amount: num(t.amount) });
/** `"051 664 33 42"` or `"51 664 33 42"` → `994516643342`. */
export const toMsisdn = (display: string) => `994${display.replace(/\D/g, '').replace(/^0/, '').slice(-9)}`;
