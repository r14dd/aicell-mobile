import { api, num } from '@/api/client';
import type { MoneyResponse } from '@/api/billing';
import type { InternetPack, InternetPacksData, PackApp, PackPlan, PackRow, SocialDetail, SocialPack } from '@/data/internetPacks';

type ApiPack = { id: string; name: string; sub: string; price: string; renews: boolean; label: string };
type ApiSocialCard = {
  id: string;
  title: string;
  subtitle: string;
  app: string;
  range: string;
  special: boolean;
  volume: string;
  periods: string[];
  cta: string;
  auto_renew: boolean;
};
type ApiInternetPacks = {
  msisdn: string;
  promo: { title: string; sub: string; gradient: string[] };
  categories: { id: string; label: string }[];
  packs: Record<string, ApiPack[]>;
  social: ApiSocialCard[];
};
type ApiSocialDetail = {
  id: string;
  title: string;
  app: string;
  badge: string | null;
  cta: string;
  default_plan: string;
  note: string;
  plans: { id: string; title: string; price: string; validity: string }[];
  rows: PackRow[];
};
type Activation = { id: number; pack_id: string; label: string; status: string; activated_at: string; expires_at: string; auto_renew: boolean };
export type PackPurchase = MoneyResponse & { activation: Activation };

// The server names the Instagram + Facebook pack's icon `instagram`; the app's badge key is the pair.
const PACK_APP: Record<string, PackApp> = { teams: 'teams', instagram: 'instagram-facebook', 'instagram-facebook': 'instagram-facebook', tiktok: 'tiktok', youtube: 'youtube' };

const toPack = (p: ApiPack): InternetPack => ({ id: p.id, name: p.name, sub: p.sub, price: num(p.price), renews: p.renews, label: p.label });
const toSocialCard = (s: ApiSocialCard): SocialPack => ({
  id: s.id,
  title: s.title,
  subtitle: s.subtitle,
  app: PACK_APP[s.app],
  range: s.range,
  special: s.special,
  volume: s.volume,
  periods: s.periods,
});
const toPlan = (p: ApiSocialDetail['plans'][number]): PackPlan => ({ id: p.id, title: p.title, price: num(p.price), validity: p.validity });

const toInternetPacks = (r: ApiInternetPacks): InternetPacksData => ({
  categories: r.categories,
  packsByCategory: Object.fromEntries(Object.entries(r.packs).map(([id, list]) => [id, list.map(toPack)])),
  social: r.social.map(toSocialCard),
  promo: { title: r.promo.title, sub: r.promo.sub, gradient: [r.promo.gradient[0], r.promo.gradient[1]] },
  msisdn: r.msisdn,
});

const toSocialDetail = (d: ApiSocialDetail): SocialDetail => ({
  id: d.id,
  title: d.title,
  app: PACK_APP[d.app],
  badge: d.badge,
  cta: d.cta,
  defaultPlan: d.default_plan,
  note: d.note,
  plans: d.plans.map(toPlan),
  rows: d.rows,
});

/** The server fills `rows` for the default plan; the first two rows (traffic, validity) follow whichever plan is selected. */
export const rowsForPlan = (rows: PackRow[], plan: PackPlan): PackRow[] =>
  rows.map((r, i) => (i === 0 ? { ...r, value: plan.title } : i === 1 ? { ...r, value: plan.validity } : r));

export const getInternetPacks = async () => toInternetPacks(await api<ApiInternetPacks>('packs/internet/'));
export const getSocialPack = async (slug: string) => toSocialDetail(await api<ApiSocialDetail>(`packs/social/${slug}/`));

export const purchasePack = (packId: string) => api<PackPurchase>('packs/internet/purchase/', { method: 'POST', body: { pack_id: packId }, money: true });
export const activateSocialPack = (slug: string, planId: string) => api<PackPurchase>(`packs/social/${slug}/activate/`, { method: 'POST', body: { plan_id: planId }, money: true });
