import type { Social } from '@/data/mock';
import type { TotalPriceGroup } from '@/data/tariffs';

/** Low-resolution crop from the recording; swap for the brand original. */
export const bannerWantMore = require('@/assets/images/ref/banner-want-more.png');
export const bannerWantMoreAspect = 512 / 180;

/** Body panel behind the IsteSen and Change tariff content (sampled from the recording). */
export const tariffSurface = '#231C2E';

export const myTariffHeader = {
  title: 'IsteSen',
  lines: [
    { label: 'Current tariff', value: '19.10 ₼/month' },
    { label: 'Next renewal', value: '19.10 ₼/month' },
  ],
  pills: ['CURRENT TARIFF', 'PREPAID'],
};

export type UsageKind = 'internet' | 'messaging' | 'calls';

export type Usage = {
  kind: UsageKind;
  label: string;
  remaining: string;
  remainingUnit: string;
  total: string;
  totalUnit: string;
  /** Remaining over total, for the bar. */
  ratio: number;
};

export const usage: Usage[] = [
  { kind: 'internet', label: 'Internet', remaining: '7.20', remainingUnit: 'GB', total: '16', totalUnit: 'GB', ratio: 7.2 / 16 },
  { kind: 'messaging', label: 'Messaging', remaining: '1003', remainingUnit: 'MB', total: '1', totalUnit: 'GB', ratio: 1003 / 1024 },
  { kind: 'calls', label: 'Local calls', remaining: '30', remainingUnit: 'MIN.', total: '30', totalUnit: 'MIN.', ratio: 1 },
];

export const paymentDetails: { label: string; value: string }[] = [
  { label: 'Validity period', value: '30 d.' },
  { label: 'Activation date', value: '24.09.2026, 00:00' },
  { label: 'Last payment date', value: '24.09.2026, 00:00' },
  { label: 'Next payment date', value: '25.10.2026, 08:00' },
  { label: 'Payment amount', value: '19.10 ₼' },
];

const overageRows = [
  { label: 'Internet - 1 MB', value: 0.05 },
  { label: 'Local calls - 1 MIN.', value: 0.19 },
  { label: 'Local SMS - 1 SMS', value: 0.1 },
  { label: 'International SMS - 1 SMS', value: 0.25 },
];

/** "Total price" detail of this tariff: the same four rates twice. */
export const totalPriceGroups: TotalPriceGroup[] = [
  { heading: 'When you use all package, prices will be next:', tone: 'secondary', rows: overageRows },
  { heading: 'If monthly fee is not paid:', tone: 'red', rows: overageRows },
];

export const chargingNote = 'Charging interval: 1 minute for calls';

export const renewCopy = {
  title: 'Renew tariff',
  body: 'By renewing tariff, the remaining balance will be annulled but the existing old internet packs will still stay active.',
};

/** Everything `tariffs/my/` sends, in the shape the My tariff page renders. */
export type MyTariff = {
  title: string;
  lines: { label: string; value: string }[];
  pills: string[];
  usage: Usage[];
  paymentDetails: { label: string; value: string }[];
  totalPriceGroups: TotalPriceGroup[];
  chargingNote: string;
  renew: { title: string; body: string };
  /** Where the "Want some more?" banner leads; `null` shows the prototype toast. */
  bannerLink: string | null;
  bannerAlt: string;
};

export const myTariffSeed: MyTariff = {
  ...myTariffHeader,
  usage,
  paymentDetails,
  totalPriceGroups,
  chargingNote,
  renew: renewCopy,
  bannerLink: '/internet-packs',
  bannerAlt: 'All you need and more!',
};

// Redesign page ------------------------------------------------------------

export type SliderKey = 'internet' | 'calls' | 'instagramFb' | 'youtube' | 'tiktok';

export type RedesignSlider = { key: SliderKey; label: string; min: number; max: number; step: number; initial: number };

export const redesignSliders: RedesignSlider[] = [
  { key: 'internet', label: 'Internet GB', min: 0, max: 16, step: 1, initial: 16 },
  { key: 'calls', label: 'Local calls min.', min: 30, max: 350, step: 10, initial: 30 },
  { key: 'instagramFb', label: 'Instagram & FB GB', min: 0, max: 5, step: 1, initial: 0 },
  { key: 'youtube', label: 'YouTube GB', min: 0, max: 10, step: 1, initial: 0 },
  { key: 'tiktok', label: 'TikTok GB', min: 0, max: 10, step: 1, initial: 0 },
];

/** Prototype estimate: the recording only shows the unchanged "Save: 19.10 ₼". */
export const redesignPricing = { base: 19.1, perGb: 0.5, perMinute: 0.02 };

export type Redesign = { sliders: RedesignSlider[]; pricing: typeof redesignPricing; /** Price of the unchanged tariff. */ estimate: number };

export const redesignSeed: Redesign = { sliders: redesignSliders, pricing: redesignPricing, estimate: redesignPricing.base };

// Change tariff page -------------------------------------------------------

export type ChangeFeatureKind = 'data' | 'minutes' | 'sms' | 'roaming';

export type ChangeTariff = {
  id: string;
  name: string;
  /** Price text as shown, ranges included. */
  price: string;
  period?: string;
  tagline?: string;
  isNew?: boolean;
  socials: Social[];
  features: { kind: ChangeFeatureKind; label: string }[];
  /** Tariff family opened by `/tariffs/[id]`; cards without one show a prototype toast. */
  familyId?: string;
};

export type ChangeGroup = { key: string; label: string; tariffs: ChangeTariff[] };

const allSocials: Social[] = ['whatsapp', 'telegram', 'instagram', 'facebook', 'tiktok'];

export const changeGroups: ChangeGroup[] = [
  {
    key: 'digimax',
    label: 'DigiMax',
    tariffs: [
      {
        id: 'digimax',
        name: 'DigiMax',
        price: '12-30',
        period: '28 days',
        socials: allSocials,
        features: [
          { kind: 'data', label: '5-25 GB' },
          { kind: 'minutes', label: '300-1500 min.' },
          { kind: 'sms', label: '150-500 SMS' },
        ],
        familyId: 'digimax',
      },
      {
        id: 'digimax-3gb',
        name: 'DigiMax 3GB',
        price: '8',
        period: '14 days',
        socials: [],
        features: [
          { kind: 'data', label: '3 GB' },
          { kind: 'minutes', label: '200 min.' },
          { kind: 'sms', label: '100 SMS' },
        ],
      },
      {
        id: 'digimax-weekly',
        name: 'DigiMax Həftəlik',
        price: '4',
        period: '7 days',
        socials: [],
        features: [
          { kind: 'data', label: '1 GB' },
          { kind: 'minutes', label: '100 min.' },
          { kind: 'sms', label: '50 SMS' },
        ],
      },
      {
        id: 'digimax-daily',
        name: 'DigiMax Günlük',
        price: '1',
        period: '1 day',
        socials: [],
        features: [
          { kind: 'data', label: '300 MB' },
          { kind: 'minutes', label: '30 min.' },
          { kind: 'sms', label: '15 SMS' },
        ],
      },
    ],
  },
  {
    key: 'premium',
    label: 'Premium+',
    tariffs: [
      {
        id: 'premium-plus',
        name: 'Premium+',
        price: '60-90',
        tagline: 'Choose excellence!',
        isNew: true,
        socials: allSocials,
        features: [
          { kind: 'data', label: '60-100 GB' },
          { kind: 'minutes', label: '3000-5000 min.' },
          { kind: 'sms', label: '1500-2500 SMS' },
          { kind: 'roaming', label: '1-3 GB roaming' },
        ],
        familyId: 'premium-plus',
      },
    ],
  },
];
