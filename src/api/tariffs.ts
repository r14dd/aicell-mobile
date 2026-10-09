import type { Href } from 'expo-router';

import type { ApiBanner } from '@/api/content';
import type { MoneyResponse } from '@/api/billing';
import { api, errorMessage, num } from '@/api/client';
import { invalidate } from '@/api/query';
import { bannerWantMore, type ChangeFeatureKind, type ChangeGroup, type MyTariff, type Redesign, type SliderKey, type Usage, type UsageKind } from '@/data/myTariff';
import { homeBanners, partnerPerks, productBanners, type Banner, type RemoteImage, type Social } from '@/data/mock';
import {
  hotTariffSeed,
  type FeatureKind,
  type HotTariff,
  type PremiumBenefit,
  type PremiumPage,
  type TariffPage,
  type TotalPriceGroup,
} from '@/data/tariffs';

export type UsageRow = { kind: 'internet' | 'messaging' | 'calls'; label: string; remaining: string; remaining_unit: string; total: string; total_unit: string; ratio: number };
export type MyUsage = {
  tariff: string;
  renewal_label: string;
  period_left: { days: number; hours: number };
  remaining: { data_gb: string; data_total_gb: string; minutes: number; minutes_total: number };
  rows: UsageRow[];
  aggregation: { title: string; body: string }[];
};

export const getMyUsage = () => api<MyUsage>('tariffs/my/usage/');

type ApiPriceGroup = { heading: string; tone: 'secondary' | 'red'; rows: { label: string; price: string }[] };
export type ApiFamily = {
  id: string;
  name: string;
  subtitle: string | null;
  badges: string[];
  is_premium: boolean;
  plans: {
    id: string;
    title: string;
    price: string;
    hot: boolean;
    features: { kind: FeatureKind; label: string; value: string; socials?: string[] }[];
  }[];
  selected_plan: string;
  total_price: ApiPriceGroup[];
  note: string;
  cta: string;
};
export type ApiHotTariff = {
  id: string;
  family_id: string;
  title: string;
  price: string;
  socials: string[];
  features: { kind: 'data' | 'minutes' | 'sms' | 'roaming'; value: string }[];
};
export type ApiMyTariff = {
  family: string;
  title: string;
  pills: string[];
  lines: { label: string; value: string }[];
  usage: UsageRow[];
  payment_details: { label: string; value: string }[];
  total_price: ApiPriceGroup[];
  charging_note: string;
  banner: { image: string; alt: string; deep_link: string | null };
  renew: { title: string; body: string };
};
export type ApiRedesign = {
  estimate: string;
  pricing: { base: string; per_gb: string; per_minute: string };
  sliders: { key: SliderKey; label: string; min: number; max: number; step: number; value: number }[];
};
export type ApiChangeGroup = {
  id: string;
  title: string;
  cards: {
    id: string;
    family_id: string | null;
    title: string;
    tagline: string | null;
    price: string;
    period: string | null;
    is_new: boolean;
    socials: string[];
    features: { kind: ChangeFeatureKind; value: string }[];
  }[];
};
export type ApiPremium = { benefits: PremiumBenefit[]; logo: string; note: string };

/** Paths double as `useQuery` keys, so a screen and its fetcher cannot drift apart. */
export const tariffPath = {
  hot: 'tariffs/hot/',
  my: 'tariffs/my/',
  redesign: 'tariffs/my/redesign/',
  change: 'tariffs/change/',
  premium: 'tariffs/premium/',
  family: (id: string, plan?: string) => `tariffs/catalogue/${encodeURIComponent(id)}/${plan ? `?plan=${encodeURIComponent(plan)}` : ''}`,
};

export const getHotTariffs = () => api<{ results: ApiHotTariff[] }>(tariffPath.hot);
export const getFamily = (id: string, plan?: string) => api<ApiFamily>(tariffPath.family(id, plan));
export const getMyTariff = () => api<ApiMyTariff>(tariffPath.my);
export const getRedesign = () => api<ApiRedesign>(tariffPath.redesign);
export const getChangeGroups = () => api<{ results: ApiChangeGroup[] }>(tariffPath.change);
export const getPremium = () => api<ApiPremium>(tariffPath.premium);

type Done = { message?: string } | null;
/** Answer of the three money POSTs: the new tariff, the charge and the balance. */
export type TariffPaid = MoneyResponse & {
  tariff: { family: string; plan_id: string | null; title: string; price: string; validity_days: number; activated_at: string; next_payment_at: string };
};
export const subscribeToPlan = (plan_id: string, key?: string) => api<TariffPaid>('tariffs/subscribe/', { method: 'POST', body: { plan_id }, money: true, key });
export const renewTariff = (key?: string) => api<TariffPaid>('tariffs/my/renew/', { method: 'POST', body: {}, money: true, key });
/** Stores the sliders; nothing is charged, the values apply from the next renewal. */
export const saveRedesign = (values: Record<SliderKey, number>) => api<ApiRedesign>('tariffs/my/redesign/', { method: 'POST', body: { values } });
/** A card without a catalogue page (`family_id` null). */
export const changeTariff = (tariff_id: string, key?: string) => api<TariffPaid>('tariffs/change/', { method: 'POST', body: { tariff_id }, money: true, key });
export const activatePremium = () => api<Done>('tariffs/premium/activate/', { method: 'POST', body: {} });

/**
 * Runs a tariff POST: applies the money answer when there is one, refreshes tariff data and toasts
 * `message` (text of the server, or the 501 notice); errors are toasted as the server words them.
 */
export async function runTariffAction<T extends Partial<MoneyResponse> & { message?: string }>(
  call: () => Promise<T | null>,
  toast: (message: string) => void,
  onMoney?: (res: MoneyResponse) => void,
  message?: (res: T) => string,
) {
  try {
    const res = await call();
    if (res && typeof res.balance === 'string') onMoney?.({ balance: res.balance, transaction: res.transaction });
    invalidate('tariffs/');
    invalidate('insights/');
    invalidate('usage/');
    const text = res ? (res.message ?? message?.(res)) : undefined;
    if (text) toast(text);
    return res;
  } catch (e) {
    toast(errorMessage(e));
    return null;
  }
}

const knownSocials: readonly string[] = ['whatsapp', 'telegram', 'instagram', 'facebook', 'tiktok'];
/** The app draws five networks; others the server may list (YouTube) are dropped rather than crash the icon lookup. */
const toSocials = (list: string[]) => list.filter((s): s is Social => knownSocials.includes(s));

const toTotalPrice = (groups: ApiPriceGroup[]): TotalPriceGroup[] =>
  groups.map((g) => ({ heading: g.heading, tone: g.tone, rows: g.rows.map((r) => ({ label: r.label, value: num(r.price) })) }));

export const toTariffPage = (f: ApiFamily): TariffPage => ({
  family: {
    id: f.id,
    name: f.name,
    subtitle: f.subtitle ?? undefined,
    badges: f.badges,
    premium: f.is_premium,
    defaultPlanId: f.selected_plan,
    plans: f.plans.map((p) => ({
      id: p.id,
      title: p.title,
      price: num(p.price),
      hot: p.hot,
      features: p.features.map((x) => ({ kind: x.kind, label: x.label, value: x.value, socials: x.socials ? toSocials(x.socials) : undefined })),
    })),
  },
  totalPrice: toTotalPrice(f.total_price),
  note: f.note,
  cta: f.cta,
});

export const toHotTariffs = ({ results }: { results: ApiHotTariff[] }): HotTariff[] =>
  results.map((t) => {
    const known = hotTariffSeed.find((h) => h.id === t.id);
    return {
      id: t.id,
      familyId: t.family_id,
      name: t.title,
      price: num(t.price),
      period: known?.period,
      tagline: known?.tagline,
      socials: toSocials(t.socials),
      features: t.features.map((f) => ({ kind: f.kind, label: f.value })),
    };
  });

const seedBanners = [...homeBanners, ...productBanners, ...partnerPerks];
/** Artwork the app ships for keys the seed banner lists do not carry. */
const extraArtwork: Record<string, RemoteImage> = { 'want-more': bannerWantMore };

/** Local artwork wins by banner `key` (the server's image files are not reachable); unknown keys load their `image` URL. */
export const toBanners = ({ results }: { results: ApiBanner[] }): Banner[] =>
  results.map((b) => {
    const known = seedBanners.find((s) => s.key === b.key);
    const target = b.deep_link ? { href: b.deep_link as Href } : { note: known?.note ?? 'This page is not part of this prototype yet' };
    return { key: b.key, image: known?.image ?? extraArtwork[b.key] ?? { uri: b.image }, alt: b.alt, ...target };
  });

const toUsage = (r: UsageRow): Usage => ({
  kind: r.kind satisfies UsageKind,
  label: r.label,
  remaining: r.remaining,
  remainingUnit: r.remaining_unit.toUpperCase(),
  total: r.total,
  totalUnit: r.total_unit.toUpperCase(),
  ratio: r.ratio,
});

/**
 * `2026-10-25T08:00:00+04:00` → `25.10.2026, 08:00`. The digits are already Baku time, so no timezone maths.
 * The amount row arrives as a bare money string (`19.10`); the page shows it with the currency sign.
 */
const bakuStamp = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::\d{2})?\+04:00$/;
const toPaymentValue = (value: string) => {
  const m = bakuStamp.exec(value);
  if (m) return `${m[3]}.${m[2]}.${m[1]}, ${m[4]}:${m[5]}`;
  return /^\d+\.\d{2}$/.test(value) ? `${value} ₼` : value;
};

export const toMyTariff = (m: ApiMyTariff): MyTariff => ({
  title: m.title,
  lines: m.lines,
  pills: m.pills,
  usage: m.usage.map(toUsage),
  paymentDetails: m.payment_details.map((d) => ({ label: d.label, value: toPaymentValue(d.value) })),
  totalPriceGroups: toTotalPrice(m.total_price),
  chargingNote: m.charging_note,
  renew: m.renew,
  bannerLink: m.banner.deep_link,
  bannerAlt: m.banner.alt,
});

export const toRedesign = (r: ApiRedesign): Redesign => ({
  sliders: r.sliders.map((s) => ({ key: s.key, label: s.label, min: s.min, max: s.max, step: s.step, initial: s.value })),
  pricing: { base: num(r.pricing.base), perGb: num(r.pricing.per_gb), perMinute: num(r.pricing.per_minute) },
  estimate: num(r.estimate),
});

export const toChangeGroups = ({ results }: { results: ApiChangeGroup[] }): ChangeGroup[] =>
  results.map((g) => ({
    key: g.id,
    label: g.title,
    tariffs: g.cards.map((c) => ({
      id: c.id,
      name: c.title,
      price: c.price,
      period: c.period ?? undefined,
      tagline: c.tagline ?? undefined,
      isNew: c.is_new,
      socials: toSocials(c.socials),
      features: c.features.map((f) => ({ kind: f.kind, label: f.value })),
      familyId: c.family_id ?? undefined,
    })),
  }));

export const toPremium = (p: ApiPremium): PremiumPage => ({ benefits: p.benefits, note: p.note });
