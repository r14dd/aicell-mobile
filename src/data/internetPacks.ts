/** `unlimited`, `high-volume`, `weekly`, `daily` or `social` today; the server owns the list. */
export type PackCategoryId = string;

export const packCategories: { id: PackCategoryId; label: string }[] = [
  { id: 'unlimited', label: 'Unlimited' },
  { id: 'high-volume', label: 'High-volume' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'daily', label: 'Daily' },
  { id: 'social', label: 'Social' },
];

export type InternetPack = {
  id: string;
  /** Card title. */
  name: string;
  sub: string;
  price: number;
  /** Shows the renew glyph before `sub`. */
  renews: boolean;
  /** Item name on the payment sheet and in toasts. */
  label: string;
};

export const packsByCategory: Record<PackCategoryId, InternetPack[]> = {
  unlimited: [
    { id: 'unlimited-1h', name: '1 hour', sub: 'Unlimited speed', price: 0.99, renews: false, label: 'Unlimited 1 hour' },
    { id: 'unlimited-3h', name: '3 hours', sub: 'Unlimited speed', price: 1.99, renews: false, label: 'Unlimited 3 hours' },
  ],
  'high-volume': [
    { id: 'hv-3', name: '3 GB', sub: '28 days', price: 9, renews: true, label: '3 GB' },
    { id: 'hv-6', name: '6 GB', sub: '28 days', price: 12, renews: true, label: '6 GB' },
    { id: 'hv-12', name: '12 GB', sub: '28 days', price: 19, renews: true, label: '12 GB' },
    { id: 'hv-30', name: '30 GB', sub: '28 days', price: 29, renews: true, label: '30 GB' },
    { id: 'hv-56', name: '56 GB', sub: '28 days', price: 39, renews: true, label: '56 GB' },
  ],
  weekly: [{ id: 'weekly-2', name: 'Weekly 2 GB', sub: '1 week', price: 4, renews: true, label: 'Weekly 2 GB' }],
  daily: [
    { id: 'daily-350', name: 'Daily 350 MB', sub: '24 hours', price: 0.99, renews: true, label: 'Daily 350 MB' },
    { id: 'daily-1500', name: 'Daily 1.5 GB', sub: '24 hours', price: 1.99, renews: true, label: 'Daily 1.5 GB' },
  ],
};

export type PackApp = 'teams' | 'instagram-facebook' | 'tiktok' | 'youtube';

export type PackPlan = { id: string; title: string; price: number; validity: string };

/** A Social-tab list card. */
export type SocialPack = {
  id: string;
  title: string;
  subtitle: string;
  /** Icon key; undefined when the app has no badge for it. */
  app?: PackApp;
  /** Price range on the list card, e.g. "0.7-9.9". */
  range: string;
  /** "Special for İstəSən" strip on the list card. */
  special: boolean;
  /** Traffic chip and period chips on the list card. */
  volume: string;
  periods: string[];
};

export type PackRow = { label: string; value: string };

/** A Social pack's detail page. */
export type SocialDetail = {
  id: string;
  title: string;
  app?: PackApp;
  /** "AUTO-RENEWAL" pill; null when the pack does not renew. */
  badge: string | null;
  cta: string;
  defaultPlan: string;
  note: string;
  plans: PackPlan[];
  /** Rows as the server filled them for `defaultPlan`; `rowsForPlan` recomputes them for the chosen plan. */
  rows: PackRow[];
};

export type PackPromo = { title: string; sub: string; gradient: [string, string] };

/** Everything the packs list screen renders, in one answer. */
export type InternetPacksData = {
  categories: { id: PackCategoryId; label: string }[];
  packsByCategory: Record<PackCategoryId, InternetPack[]>;
  social: SocialPack[];
  promo: PackPromo;
  /** Digits as the API sends them; empty until the server has answered. */
  msisdn: string;
};

const mediaPlans: PackPlan[] = [
  { id: '1gb', title: '1 GB', price: 1.5, validity: '30 d.' },
  { id: '2gb', title: '2 GB', price: 2.5, validity: '30 d.' },
  { id: '5gb', title: '5 GB', price: 5, validity: '30 d.' },
];

export const socialPacks: SocialPack[] = [
  { id: 'tehsil', title: 'Tehsil', subtitle: 'Join online classes with ease via Microsoft Teams.', app: 'teams', range: '0.7-9.9', special: false, volume: '10-100 GB', periods: ['Daily', 'Monthly'] },
  { id: 'instagram-facebook', title: 'Instagram & Facebook', subtitle: 'Share moments', app: 'instagram-facebook', range: '0.75-2', special: true, volume: '500 MB-2 GB', periods: ['Monthly'] },
  { id: 'tiktok', title: 'TikTok', subtitle: 'Make every second count', app: 'tiktok', range: '1.5-5', special: true, volume: '1-5 GB', periods: ['Monthly'] },
  { id: 'youtube', title: 'YouTube', subtitle: 'Watch with confidence', app: 'youtube', range: '1.5-5', special: true, volume: '1-5 GB', periods: ['Monthly'] },
];

const socialNote = 'Internet packs are not available when the line is one-way blocked.';

const seedDetail = (card: SocialPack, plans: PackPlan[], cta: string, autoRenew: boolean): SocialDetail => ({
  id: card.id,
  title: card.title,
  app: card.app,
  badge: autoRenew ? 'AUTO-RENEWAL' : null,
  cta,
  defaultPlan: plans[0].id,
  note: socialNote,
  plans,
  rows: [
    { label: 'Application traffic', value: plans[0].title },
    { label: 'Validity period', value: plans[0].validity },
    ...(autoRenew ? [{ label: 'Renews', value: 'Automatically' }] : []),
  ],
});

export const socialDetails: SocialDetail[] = [
  seedDetail(socialPacks[0], [{ id: '10gb', title: '10 GB', price: 0.7, validity: '1 d.' }, { id: '100gb', title: '100 GB', price: 9.9, validity: '30 d.' }], 'Subscribe', true),
  seedDetail(socialPacks[1], [{ id: '500mb', title: '500 MB', price: 0.75, validity: '30 d.' }, { id: '1gb', title: '1 GB', price: 1.2, validity: '30 d.' }, { id: '2gb', title: '2 GB', price: 2, validity: '30 d.' }], 'Activate', false),
  seedDetail(socialPacks[2], mediaPlans, 'Activate', false),
  seedDetail(socialPacks[3], mediaPlans, 'Activate', false),
];

export const findSocialDetail = (id?: string) => socialDetails.find((p) => p.id === id) ?? socialDetails[0];

export const internetPacksSeed: InternetPacksData = {
  categories: packCategories,
  packsByCategory,
  social: socialPacks,
  promo: { title: 'Unlimited entertainment is waiting for you!', sub: 'For only 0.99 ₼', gradient: ['#8C80FE', '#4670E2'] },
  msisdn: '',
};
