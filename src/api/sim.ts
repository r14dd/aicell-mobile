import { api, num } from '@/api/client';
import type { MoneyResponse } from '@/api/billing';
import type { RoamingPack } from '@/data/simSettings';
import type { Segment, ServiceSection, SimService } from '@/data/simServices';

export type SimOverview = {
  msisdn: string;
  lte_enabled: boolean;
  badge: string;
  details: { label: string; value: string }[];
  rows: { key: string; label: string; deep_link: string | null }[];
};
export type LineSettings = {
  status: 'open' | 'suspended' | 'closed';
  status_title: string;
  status_sub: string;
  mobile_internet: boolean;
  second_line: boolean;
  call_forwarding_status: string;
  texts: { second_line_sub: string; internet_settings_link: string };
};
export type LineStatus = { title: string; general: string; fee: string; suspend_until: string; consequences: string[]; cta: string };
export type Forwarding = { all: boolean; unanswered: boolean; busy: boolean; unreachable: boolean };
export type RoamingState = { enabled: boolean; changed_at: string | null; texts: { search_title: string; search_placeholder: string; packs_title: string } };
export type RoamingPacks = { results: { id: string; name: string; sub: string; price: string }[]; confirm: { title: string; body: string; decline: string; confirm: string } };
export type SmsSettings = { language: 'az' | 'en' | 'ru'; languages: { id: 'az' | 'en' | 'ru'; name: string }[]; toggles: { ads: boolean; campaigns: boolean; partners: boolean } };
export type Puk = { codes: { label: string; value: string }[]; paragraphs: Segment[][] };
export type ApiService = { id: string; name: string; sub: string; period: string; price: string | null; activated: boolean; badge: string | null };
export type ApiServiceSection = { text: string } | { rows: { label: string; value: string }[] } | { option: { id: string; label: string; sub: string } };
export type ApiServiceDetail = ApiService & { sections: ApiServiceSection[]; action: { kind: 'subscribe' | 'deactivate'; label: string } };
export type Esim = {
  benefits: { key: string; title: string; body: string }[];
  asan_note: string;
  actions: { key: string; label: string; deep_link?: string | null }[];
};
export type Activation = { id: number; pack_id: string; label: string; status: string; activated_at: string; expires_at: string; auto_renew: boolean };

export const getSim = () => api<SimOverview>('sim/');
export const getLine = () => api<LineSettings>('sim/line/');
export const patchLine = (body: Partial<Pick<LineSettings, 'mobile_internet' | 'second_line'>>) => api<LineSettings>('sim/line/', { method: 'PATCH', body });
export const requestInternetSettings = () => api<{ message?: string }>('sim/line/internet-settings/', { method: 'POST', body: {} });
export const getLineStatus = () => api<LineStatus>('sim/line/status/');
export const closeLine = () => api<{ message?: string }>('sim/line/close/', { method: 'POST', body: {} });
export const getForwarding = () => api<Forwarding>('sim/call-forwarding/');
export const patchForwarding = (body: Partial<Forwarding>) => api<Forwarding>('sim/call-forwarding/', { method: 'PATCH', body });
export const getRoaming = () => api<RoamingState>('sim/roaming/');
export const patchRoaming = (enabled: boolean) => api<RoamingState>('sim/roaming/', { method: 'PATCH', body: { enabled } });
export const getRoamingPacks = () => api<RoamingPacks>('packs/roaming/');
export const purchaseRoamingPack = (pack_id: string, key?: string) => api<MoneyResponse & { activation: Activation }>('packs/roaming/purchase/', { method: 'POST', body: { pack_id }, money: true, key });
export const getSms = () => api<SmsSettings>('sim/sms/');
export const patchSms = (body: { language?: 'az' | 'en' | 'ru'; toggles?: Partial<SmsSettings['toggles']> }) => api<SmsSettings>('sim/sms/', { method: 'PATCH', body });
export const getPuk = () => api<Puk>('sim/puk/');
export const getServices = () => api<{ results: ApiService[] }>('sim/services/');
export const getService = (slug: string) => api<ApiServiceDetail>(`sim/services/${slug}/`);
export const subscribeService = (slug: string, options: string[] = [], key?: string) => api<MoneyResponse & { subscription: { id: number; service: string; status: string; next_payment_at: string } }>(`sim/services/${slug}/subscribe/`, { method: 'POST', body: { options }, money: true, key });
export const deactivateService = (slug: string) => api<{ message?: string }>(`sim/services/${slug}/deactivate/`, { method: 'POST', body: {} });
export const getEsim = () => api<Esim>('sim/esim/');
export const transferEsim = () => api<{ message?: string }>('sim/esim/transfer/', { method: 'POST', body: {} });
export const recoverEsim = (body: { code: string; msisdn: string }) => api<{ message?: string }>('sim/esim/recover/', { method: 'POST', body });

/** `2027-01-23` → `23 January 2027`. */
export const longDay = (ymd: string) => {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }).replace(/^0/, '');
};

export const toRoamingPack = (p: RoamingPacks['results'][number]): RoamingPack => ({ id: p.id, name: p.name, sub: p.sub, price: num(p.price) });

/** List card shape; the detail sections are filled by `toServiceDetail`. */
export const toService = (s: ApiService): SimService => ({
  id: s.id as SimService['id'],
  name: s.name,
  sub: s.sub,
  period: s.period,
  price: s.price === null ? undefined : num(s.price),
  activated: s.activated,
  badge: s.badge ?? '',
  sections: [],
  action: { label: '', notice: '' },
});

/** Server sections carry no headings; the headings follow the recorded detail pages. */
export const toServiceDetail = (s: ApiServiceDetail): SimService => ({
  ...toService(s),
  subtitle: s.sub,
  sections: s.sections.map((section): ServiceSection => {
    if ('text' in section) return { kind: 'text', title: 'General information', text: section.text };
    if ('rows' in section) return { kind: 'rows', title: `${s.name} details`, rows: section.rows };
    return { kind: 'option', title: 'Additionally:', name: section.option.label, sub: section.option.sub, price: 'Free', id: section.option.id };
  }),
  action:
    s.action.kind === 'subscribe'
      ? { label: s.action.label, purchase: { amount: num(s.price ?? 0), title: `${s.name} service`, success: `${s.name} subscribed for ${s.price} ₼`, failure: 'Not enough balance for this service' } }
      : { label: s.action.label, notice: 'Deactivating this service is not part of this prototype yet' },
});
