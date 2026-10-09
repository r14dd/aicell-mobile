import type { MoneyResponse } from '@/api/billing';
import { api } from '@/api/client';
import type { Activation } from '@/api/sim';

type Navigate = { action: 'navigate'; to: string; label: string };

export type UsageSummary = {
  window: { days: number; from: string; to: string };
  segment: { key: string; label: string };
  headline: string;
  totals: { data_mb: number; data_gb: string; minutes: number; sms: number; roaming_data_mb: number; roaming_minutes: number; roaming_days: number };
  daily_average: { data_mb: number; minutes: number; sms: number };
  data_by_category: { key: string; label: string; data_mb: number; share: number }[];
  data_by_app: { key: string; label: string; category: string; data_mb: number; share: number }[];
  data_ran_out: { day: number; date: string; period_days: number } | null;
  spend: { tariff_fee: string; addon_packs: { count: number; amount: string }; roaming: { count: number; amount: string }; other: string; total: string };
  services: { id: string; name: string }[];
};
export type Recommendation = {
  kind: 'tariff_plan' | 'internet_pack' | 'social_pack' | 'roaming_pack' | 'redesign';
  target_id: string;
  title: string;
  current_monthly_cost: string;
  projected_monthly_cost: string;
  saving: string;
  evidence: string[];
  action: Navigate;
  values?: Record<string, number>;
  plan_id?: string;
  quantity?: number;
};
export type PersonalOffer = {
  id: number;
  kind: string;
  target_id: string;
  title: string;
  normal_price: string;
  offer_price: string;
  reason: string;
  status: 'new' | 'shown' | 'accepted' | 'declined' | 'expired';
  expires_at: string;
  action: Navigate;
};
export type Recommendations = {
  window_days: number;
  segment: { key: string; label: string };
  current_monthly_cost: string;
  fits: boolean;
  message: string;
  recommendations: Recommendation[];
  insights: { category: string; share: number; text: string; sells: { kind: string; target_id: string; title: string; action: Navigate }[] }[];
  offer: PersonalOffer | null;
};
export type OfferAccepted = Partial<MoneyResponse> & { offer: PersonalOffer; activation?: Activation; action?: Navigate };

export const RECOMMENDATIONS_KEY = 'usage/recommendations/';

export const getUsageSummary = (days = 30) => api<UsageSummary>(`usage/summary/?days=${days}`);
/** Ranked recommendations for the last 30 days plus the open personal offer (returning it marks it shown). */
export const getRecommendations = () => api<Recommendations>(RECOMMENDATIONS_KEY);
/** Buys the offered pack at the offer price (money POST). */
export const acceptOffer = (id: number, key?: string) => api<OfferAccepted>(`usage/offers/${id}/accept/`, { method: 'POST', body: {}, money: true, key });
export const declineOffer = (id: number) => api<{ offer: PersonalOffer }>(`usage/offers/${id}/decline/`, { method: 'POST', body: {} });
