import { hotTariffs, type Social, type TariffOffer } from '@/data/mock';

export type FeatureKind = 'internet' | 'calls' | 'sms' | 'social' | 'app' | 'roaming' | 'validity';

export type TariffFeature = { kind: FeatureKind; label: string; value: string; socials?: Social[] };

export type TariffPlan = { id: string; title: string; price: number; hot?: boolean; features: TariffFeature[] };

export type TariffFamily = {
  id: string;
  name: string;
  subtitle?: string;
  badges: string[];
  premium?: boolean;
  /** Plan selected when the page opens without a valid `plan` param. */
  defaultPlanId: string;
  plans: TariffPlan[];
};

const allSocials: Social[] = ['whatsapp', 'telegram', 'instagram', 'facebook', 'tiktok'];

export const tariffFamilies: TariffFamily[] = [
  {
    id: 'digimax',
    name: 'DigiMax',
    badges: ['PREPAID'],
    defaultPlanId: 'digimax-10',
    plans: [
      {
        id: 'digimax-5',
        title: 'DigiMax 5GB',
        price: 12,
        features: [
          { kind: 'internet', label: 'Internet', value: '5 GB' },
          { kind: 'calls', label: 'Local calls', value: '300 min' },
          { kind: 'sms', label: 'Local SMS', value: '150 SMS' },
          { kind: 'social', label: 'Messaging', value: '1 GB', socials: ['whatsapp'] },
          { kind: 'validity', label: 'Validity period', value: '28 d.' },
        ],
      },
      {
        id: 'digimax-10',
        title: 'DigiMax 10GB',
        price: 18,
        hot: true,
        features: [
          { kind: 'internet', label: 'Internet', value: '10 GB' },
          { kind: 'calls', label: 'Local calls', value: '600 min' },
          { kind: 'sms', label: 'Local SMS', value: '300 SMS' },
          { kind: 'social', label: 'Social media', value: '1 GB', socials: ['whatsapp', 'telegram', 'instagram', 'facebook'] },
          { kind: 'app', label: 'Application traffic', value: '1 GB', socials: ['whatsapp'] },
          { kind: 'validity', label: 'Validity period', value: '28 d.' },
        ],
      },
      {
        id: 'digimax-25',
        title: 'DigiMax 25GB',
        price: 30,
        hot: true,
        features: [
          { kind: 'internet', label: 'Internet', value: '25 GB' },
          { kind: 'calls', label: 'Local calls', value: '1500 min' },
          { kind: 'sms', label: 'Local SMS', value: '500 SMS' },
          { kind: 'social', label: 'Social media', value: '3 GB', socials: allSocials },
          { kind: 'app', label: 'Application traffic', value: '3 GB', socials: ['whatsapp'] },
          { kind: 'validity', label: 'Validity period', value: '28 d.' },
        ],
      },
    ],
  },
  {
    id: 'premium-plus',
    name: 'Premium+',
    subtitle: 'Choose excellence!',
    badges: ['PREPAID', 'PREMIUM'],
    premium: true,
    defaultPlanId: 'premium-60',
    plans: [
      {
        id: 'premium-60',
        title: 'Premium+ 60GB',
        price: 60,
        features: [
          { kind: 'internet', label: 'Internet', value: '60 GB' },
          { kind: 'calls', label: 'Local calls', value: '3000 min' },
          { kind: 'sms', label: 'Local SMS', value: '1500 SMS' },
          { kind: 'social', label: 'Social media', value: '5 GB', socials: allSocials },
          { kind: 'app', label: 'Application traffic', value: '5 GB', socials: ['whatsapp'] },
          { kind: 'roaming', label: 'Roaming', value: '1 GB' },
          { kind: 'validity', label: 'Validity period', value: '28 d.' },
        ],
      },
      {
        id: 'premium-100',
        title: 'Premium+ 100GB',
        price: 90,
        hot: true,
        features: [
          { kind: 'internet', label: 'Internet', value: '100 GB' },
          { kind: 'calls', label: 'Local calls', value: '5000 min' },
          { kind: 'sms', label: 'Local SMS', value: '2500 SMS' },
          { kind: 'social', label: 'Social media', value: '10 GB', socials: allSocials },
          { kind: 'app', label: 'Application traffic', value: '10 GB', socials: ['whatsapp'] },
          { kind: 'roaming', label: 'Roaming', value: '3 GB' },
          { kind: 'validity', label: 'Validity period', value: '28 d.' },
        ],
      },
    ],
  },
];

/** Unknown ids fall back to DigiMax. */
export function findTariffFamily(id: string | undefined) {
  return tariffFamilies.find((f) => f.id === id) ?? tariffFamilies[0];
}

export type TotalPriceGroup = { heading: string; tone: 'secondary' | 'red'; rows: { label: string; value: number }[] };

const overageRows = [
  { label: 'Internet - 1MB', value: 0.05 },
  { label: 'Local calls - 1 MIN.', value: 0.19 },
  { label: 'Local SMS - 1 SMS', value: 0.1 },
  { label: 'International calls - 1 MIN.', value: 0.5 },
  { label: 'International SMS - 1 SMS', value: 0.25 },
];

/** "Total price" detail shared by every tariff: two groups of the same five rates. */
export const totalPriceGroups: TotalPriceGroup[] = [
  { heading: 'When you use all package, prices will be next:', tone: 'secondary', rows: overageRows },
  { heading: 'If monthly fee is not paid:', tone: 'red', rows: overageRows },
];

export const tariffNote =
  'When the subscription fee of the tariff is paid, the line of the number will remain bilaterally active for 28 days.';

/** One tariff family page: the plans plus the texts around them. */
export type TariffPage = {
  family: TariffFamily;
  totalPrice: TotalPriceGroup[];
  note: string;
  /** Server button text for `family.defaultPlanId`; the other plans compose theirs from their price. */
  cta?: string;
};

/** Offline copy of a family page; an unknown `plan` falls back to the family's own default. */
export function tariffPageSeed(id: string | undefined, plan?: string): TariffPage {
  const family = findTariffFamily(id);
  const defaultPlanId = family.plans.find((p) => p.id === plan)?.id ?? family.defaultPlanId;
  return { family: { ...family, defaultPlanId }, totalPrice: totalPriceGroups, note: tariffNote };
}

/** Hot offer card: the API sends neither period nor tagline, so those come from the matching seed entry. */
export type HotTariff = Omit<TariffOffer, 'period'> & { period?: string; familyId: string };

export const hotTariffSeed: HotTariff[] = hotTariffs.map((t) => ({ ...t, familyId: t.id.startsWith('premium') ? 'premium-plus' : 'digimax' }));

export type PremiumBenefit = { key: string; text: string };
export type PremiumPage = { benefits: PremiumBenefit[]; note: string };

export const premiumBenefits: PremiumBenefit[] = [
  { key: 'curator', text: 'Personal curator for all your needs' },
  { key: 'priority', text: 'Priority when viewing requests and complaints' },
  { key: 'free', text: 'Free services: SIM card change, Detailed invoice, Soclir' },
  { key: 'kinon', text: 'The 6-month special offer for Kinon Premium subscription' },
  { key: 'pasha', text: '20% discount on PASHA Insurance (CASCO)' },
  { key: 'ateshgah', text: '20% discount on Ateshgah Insurance' },
  { key: 'wolt', text: '6 months of Wolt+ subscription for free' },
  { key: 'theme', text: 'Premium Gold theme' },
];

export const premiumNote = 'To access the Premium theme you must log in with Premium number as main account';

export const premiumSeed: PremiumPage = { benefits: premiumBenefits, note: premiumNote };
