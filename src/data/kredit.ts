import type { Href } from 'expo-router';

export const kreditDebt = { amount: 0, note: 'no items' };

export type KreditProduct = {
  id: string;
  name: string;
  subtitle: string;
  chip: string;
  chipIcon: 'coins' | 'broadcast';
  price?: string;
  href?: Href;
  note?: string;
};

export const kreditProducts: KreditProduct[] = [
  {
    id: 'simkredit',
    name: 'SimKredit',
    subtitle: 'Get now! Pay back at the next topup',
    chip: '1-3 ₼',
    chipIcon: 'coins',
    href: '/kredit/simkredit',
  },
  {
    id: 'simtaksit',
    name: 'SimTaksit',
    subtitle: 'Get now! Pay back within 32 days by 0.08 ₼',
    chip: '2 ₼',
    chipIcon: 'coins',
    href: '/kredit/simtaksit',
  },
  {
    id: 'internetkredit',
    name: 'InternetKredit',
    subtitle: 'Get now! Pay back at the next topup',
    chip: '300 MB',
    chipIcon: 'broadcast',
    price: '2 ₼',
    href: '/kredit/internetkredit',
  },
  {
    id: 'ekstrakredit',
    name: 'EkstraKredit',
    subtitle: 'Get now! Pay back at the next topup',
    chip: '1 ₼',
    chipIcon: 'coins',
    href: '/kredit/ekstrakredit',
  },
];

export type KreditData = { debt: typeof kreditDebt; products: KreditProduct[] };

export const kreditSeed: KreditData = { debt: kreditDebt, products: kreditProducts };

/** A credit's detail page: amount and fee in manat unless noted. */
export type KreditDetail = {
  id: string;
  name: string;
  amount: number;
  fee: number;
  unit: string;
  /** Primary button text for `amount`. */
  cta: string;
  /** Selectable amounts (SimKredit). */
  options: number[];
  amountMb?: number;
  validityDays?: number;
};

export const kreditDetailSeeds: Record<string, KreditDetail> = {
  simkredit: { id: 'simkredit', name: 'SimKredit', amount: 1, fee: 0.3, unit: '₼', cta: 'Get SimKredit 1.00 ₼', options: [1, 2, 3] },
  simtaksit: { id: 'simtaksit', name: 'SimTaksit', amount: 2, fee: 0.6, unit: '₼', cta: 'Get SimTaksit 2.00 ₼', options: [] },
  internetkredit: { id: 'internetkredit', name: 'InternetKredit', amount: 2, fee: 0, unit: '₼', cta: 'Get InternetKredit 2.00 ₼', options: [], amountMb: 300, validityDays: 7 },
  ekstrakredit: { id: 'ekstrakredit', name: 'EkstraKredit', amount: 1, fee: 0.4, unit: '₼', cta: 'Get EkstraKredit 1.00 ₼', options: [] },
};

export const akartBannerAlt = 'Instant loan with akart! Complete your payments up to 50 ₼ with akart loan';

export const tamamlaSteps = [
  'Apply for akart with ease: Simply provide your ID details and verify your identity!',
  'Give permission to borrow up to 50.00 ₼ whenever you need it most with Tamamla',
  'Activate Tamamla & Cover unexpected expenses!',
];

export type TamamlaData = { alt: string; steps: string[]; cta: { label: string; url: string } };

export const tamamlaSeed: TamamlaData = { alt: akartBannerAlt, steps: tamamlaSteps, cta: { label: 'Get now!', url: 'https://links.akart.az/app/' } };
