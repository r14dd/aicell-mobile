import { api, num } from '@/api/client';

type ApiReferral = {
  code: string;
  earned: string;
  headline: string;
  share_message: string;
  share_url: string;
  terms_url: string | null;
  steps: { title: string; body: string }[];
};
export type Referral = { code: string; earned: number; headline: string; steps: { title: string; body: string }[]; shareMessage: string };

/** The link goes inside the message because only iOS sends a separate `url`. */
const toReferral = (r: ApiReferral): Referral => ({
  code: r.code,
  earned: num(r.earned),
  headline: r.headline,
  steps: r.steps,
  shareMessage: [r.share_message, r.share_url].filter(Boolean).join('\n'),
});

export const getReferral = () => api<ApiReferral>('referral/me/').then(toReferral);
