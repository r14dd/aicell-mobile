import type { Href } from 'expo-router';

import { api, num } from '@/api/client';
import { money } from '@/data/mock';
import type { KreditData, KreditDetail, KreditProduct, TamamlaData } from '@/data/kredit';

type ApiKreditProduct = { id: string; name: string; subtitle: string; chip: string; chip_icon: 'coins' | 'broadcast'; deep_link: string | null; /** Ready-made label such as "2 ₼". */ price?: string };
type ApiKredit = { debt: { amount: string; note: string }; products: ApiKreditProduct[] };
type ApiKreditDetail = {
  id: string;
  name: string;
  amount: string;
  fee: string;
  unit: string;
  cta: string;
  options?: string[];
  amount_mb?: number;
  validity_days?: number;
};
type ApiTamamla = { banner: { image: string; alt: string }; cta: { label: string; url: string }; steps: string[] };

const toProduct = (p: ApiKreditProduct): KreditProduct => ({
  id: p.id,
  name: p.name,
  subtitle: p.subtitle,
  chip: p.chip,
  chipIcon: p.chip_icon,
  price: p.price,
  href: p.deep_link ? (p.deep_link as Href) : undefined,
});

const toKredit = (r: ApiKredit): KreditData => ({ debt: { amount: num(r.debt.amount), note: r.debt.note }, products: r.products.map(toProduct) });

const toDetail = (d: ApiKreditDetail): KreditDetail => ({
  id: d.id,
  name: d.name,
  amount: num(d.amount),
  fee: num(d.fee),
  unit: d.unit,
  cta: d.cta,
  options: (d.options ?? []).map(num),
  amountMb: d.amount_mb,
  validityDays: d.validity_days,
});

const toTamamla = (t: ApiTamamla): TamamlaData => ({ alt: t.banner.alt, steps: t.steps, cta: t.cta });

export const getKredit = async () => toKredit(await api<ApiKredit>('kredit/'));
export const getKreditProduct = async (slug: string) => toDetail(await api<ApiKreditDetail>(`kredit/products/${slug}/`));
export const getTamamla = async () => toTamamla(await api<ApiTamamla>('kredit/tamamla/'));

/** Not balance-changing for now: the endpoint answers 501 with the text to show. */
export const takeKredit = (slug: string, amount: number) => api<unknown>(`kredit/products/${slug}/take/`, { method: 'POST', body: { amount: money(amount) } });
