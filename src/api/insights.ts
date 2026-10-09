import { api } from '@/api/client';

export type InsightKind = 'video_heavy' | 'repeat_packs' | 'overage' | 'forecast_gap' | 'social_heavy' | 'underused' | 'roaming' | 'renewal_shortfall';
export type InsightTask = { name: string; params: Record<string, unknown> };
export type InsightOffer = {
  ref: string;
  label: string;
  price: string;
  validity: string | null;
  data_gb: number | null;
  per_gb: string | null;
  saving: string | null;
  saving_year?: string | null;
  /** IsteSen slider values of a `redesign` offer. */
  values?: Record<string, number>;
  task: InsightTask;
};
export type Insight = {
  id: number;
  kind: InsightKind;
  severity: 'info' | 'urgent';
  status: 'new' | 'seen' | 'accepted' | 'dismissed' | 'expired' | 'resolved';
  created_at: string;
  expires_at: string;
  /** The figures the detector found; the fields are fixed per `kind`. */
  evidence: Record<string, unknown>;
  offers: InsightOffer[];
  /** Index into `offers`. */
  recommended: number;
};
export type AdvisorCandidate = {
  id: string;
  title: string;
  price: string;
  total_month: string;
  saving_month: string;
  saving_year?: string;
  data_gb: number | null;
  minutes: number | null;
  rejected?: string;
  redesign?: Record<string, number>;
  task: InsightTask;
};
export type Advisor = {
  period_days: number;
  profile: { data_gb_month: number; by_app_gb: Record<string, number>; minutes_month: number };
  current: { tariff: string; price: string; packs_month: string; total_month: string };
  candidates: AdvisorCandidate[];
  /** A candidate `id`, or `current` when a change saves less than 1 ₼. */
  recommended: string;
  effective_from: string;
};

export const INSIGHTS_KEY = 'insights/';
export const ADVISOR_KEY = 'insights/advisor/';

/** Insights the server lets the app show now, urgent first; the detectors run on every call. */
export const getInsights = () => api<{ results: Insight[] }>(INSIGHTS_KEY);
/** "IsteSen+": the tariff setup that fits the usage, against the current one and the nearest plan. */
export const getAdvisor = () => api<Advisor>(ADVISOR_KEY);
export const markInsightSeen = (id: number) => api<Insight>(`insights/${id}/seen/`, { method: 'POST', body: {} });
/** Records the "yes"; nothing is charged here, the task is carried out on its own endpoint. */
export const acceptInsight = (id: number, offer?: number) =>
  api<Insight & { task: InsightTask }>(`insights/${id}/accept/`, { method: 'POST', body: offer === undefined ? {} : { offer } });
/** Records the "no"; the kind stays silent for 14 days. */
export const dismissInsight = (id: number) => api<Insight>(`insights/${id}/dismiss/`, { method: 'POST', body: {} });
