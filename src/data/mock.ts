import type { Href } from 'expo-router';

import { img } from '@/data/assets';

export const subscriber = {
  name: 'Qüdrət Abidzadə',
  number: '051 664 33 42',
  plan: 'Prepaid',
  balance: 16.21,
  tariff: { name: 'IsteSen', renewal: 'Renews 25 October, 00:00' },
  remaining: { dataGb: 7.2, dataTotalGb: 20, minutes: 30, minutesTotal: 30 },
  topUpsThisMonth: 16.0,
  referralCode: 'wa16Kg',
  earned: 0,
  appVersion: 'Version 5.1.0 (13557)',
};

export type Account = { number: string; name: string; plan: 'Prepaid' | 'Postpaid'; tariff: string };

/** Numbers linked to this login; the first one is the subscriber above. */
export const accounts: Account[] = [
  { number: subscriber.number, name: subscriber.name, plan: 'Prepaid', tariff: subscriber.tariff.name },
  { number: '050 455 12 90', name: subscriber.name, plan: 'Prepaid', tariff: 'DigiMax 10GB' },
  { number: '055 821 07 33', name: subscriber.name, plan: 'Postpaid', tariff: 'Premium+ 60GB' },
];

export type Transaction = { id: string; title: string; date: string; amount: number };

export const transactions: Transaction[] = [
  { id: 't1', title: 'Number balance', date: '02 October', amount: 15.0 },
  { id: 't2', title: 'Number balance', date: '02 October', amount: 1.0 },
];

export type RemoteImage = number | { uri: string };

export type Story = { key: string; label: string; image: RemoteImage; href?: Href; note?: string };

export const homeStories: Story[] = [
  { key: 'gift-wheel', label: 'Gift Wheel', image: img.chipGiftWheel },
  { key: '30il', label: '“30 il səninlə”', image: img.chip30il },
  { key: 'wolt', label: 'Wolt+', image: img.chipWolt },
  { key: 'roaming', label: 'Roaming', image: img.chipRoaming },
  { key: 'especially', label: 'Especially for you', image: img.chipEspecially },
  { key: 'applications', label: 'Applications', image: img.chipApplications },
  { key: 'dark-mode', label: 'Dark Mode', image: img.chipDarkMode },
];

export type Banner = { key: string; image: RemoteImage; alt: string; href?: Href; note?: string };

export const homeBanners: Banner[] = [
  { key: 'akart', image: img.bannerAkart, alt: 'Instant loan with akart! Complete your payments up to 50 ₼ with akart loan', href: '/kredit/tamamla' },
  { key: 'spin', image: img.bannerSpinWheel, alt: 'Spin the Gift Wheel! Get a surprise gift', note: 'The Gift Wheel page is not part of this prototype yet' },
  { key: 'wingz', image: img.bannerWingz, alt: 'Ride Wingz, pay with Azercell balance!', note: 'The Wingz perk page is not part of this prototype yet' },
  { key: 'premium', image: img.bannerPremium, alt: 'Choose Premium+ to elevate experience! Explore', href: '/tariffs/premium-plus' },
  { key: 'digimax', image: img.bannerDigimax, alt: 'DigiMax. With your rhythm! Learn more', href: '/tariffs/digimax' },
  { key: 'esim', image: img.bannerEsim, alt: 'Transfer your number to eSIM', href: '/esim' },
  { key: 'car', image: img.bannerCar, alt: 'Azercell Mobile Sales and Service', note: 'Mobile Sales and Service booking is not part of this prototype yet' },
  { key: 'invite', image: img.bannerInvite, alt: 'Invite your friends, earn rewards! Refer a friend', href: '/invite' },
  { key: 'steam', image: img.bannerSteam, alt: 'Top up your Steam balance', href: '/steam' },
  { key: 'trophy', image: img.bannerTrophy, alt: 'Play and win. Up to 25 GB. Play now', href: '/games' },
];

export const productBanners: Banner[] = [
  { key: 'spin', image: img.bannerSpinWheel, alt: 'Spin the Gift Wheel! Get a surprise gift', note: 'The Gift Wheel page is not part of this prototype yet' },
  { key: 'digimax', image: img.bannerDigimax, alt: 'DigiMax. With your rhythm! Learn more', href: '/tariffs/digimax' },
  { key: 'esim', image: img.bannerEsim, alt: 'Transfer your number to eSIM', href: '/esim' },
];

export const partnerPerks: Banner[] = [
  { key: 'wingz', image: img.bannerWingz, alt: 'Ride Wingz, pay with Azercell balance!', note: 'Wingz perk details are not part of this prototype yet' },
  { key: 'wolt', image: img.bannerWolt, alt: 'Free 3-month subscription for new Wolt+ users', note: 'Wolt+ perk details are not part of this prototype yet' },
];

export type InternetPack = { id: string; title: string; subtitle: string; price: number; renews?: boolean };

export const topInternetPacks: InternetPack[] = [
  { id: 'p1', title: '1 hour', subtitle: 'Unlimited speed', price: 0.99 },
  { id: 'p2', title: 'Daily 350 MB', subtitle: '24 hours', price: 0.99, renews: true },
  { id: 'p3', title: 'Daily 1.5 GB', subtitle: '24 hours', price: 1.99, renews: true },
];

export type Social = 'whatsapp' | 'telegram' | 'instagram' | 'facebook' | 'tiktok';

export type TariffOffer = {
  id: string;
  name: string;
  period: string;
  tagline?: string;
  price: number;
  socials: Social[];
  features: { kind: 'data' | 'minutes' | 'sms' | 'roaming'; label: string }[];
};

export const hotTariffs: TariffOffer[] = [
  {
    id: 'digimax-10',
    name: 'DigiMax 10GB',
    period: '28 days',
    price: 18,
    socials: ['whatsapp', 'telegram', 'instagram', 'facebook'],
    features: [
      { kind: 'data', label: '10 GB' },
      { kind: 'minutes', label: '600 min.' },
      { kind: 'sms', label: '300 SMS' },
    ],
  },
  {
    id: 'digimax-25',
    name: 'DigiMax 25GB',
    period: '28 days',
    price: 30,
    socials: ['whatsapp', 'telegram', 'instagram', 'facebook', 'tiktok'],
    features: [
      { kind: 'data', label: '25 GB' },
      { kind: 'minutes', label: '1500 min.' },
      { kind: 'sms', label: '500 SMS' },
    ],
  },
  {
    id: 'premium-60',
    name: 'Premium+ 60GB',
    period: '',
    tagline: 'Choose excellence!',
    price: 60,
    socials: ['whatsapp', 'telegram', 'instagram', 'facebook', 'tiktok'],
    features: [
      { kind: 'data', label: '60 GB' },
      { kind: 'minutes', label: '3000 min.' },
      { kind: 'sms', label: '1500 SMS' },
      { kind: 'roaming', label: '1 GB roaming' },
    ],
  },
];

export type AppOffer = { id: string; name: string; description: string; from: number; monogram: string; color: string };

export const appOffers: AppOffer[] = [
  { id: 'kinon', name: 'Kinon', description: 'Video streaming service', from: 0.4, monogram: 'K', color: '#2B2B2B' },
  { id: 'yandex', name: 'Yandex Plus', description: 'Movies, books, music', from: 0.25, monogram: 'Y+', color: '#3E62F2' },
  { id: 'litres', name: 'Litres', description: 'Digital books', from: 0.15, monogram: 'L', color: '#F26A1B' },
];

export const aztelekom = {
  title: 'Fiber Optical',
  price: '33-57 ₼',
  bundle: 'Internet + TV + Telephony',
  speed: '100-500 Mbit/s',
};

export const campaigns = [{ id: 'c1', title: 'Azercellim.com campaign', image: img.campaignMan }];

export const referralSteps = [
  {
    title: 'Invite a friend who doesn’t have an account on the Azercell app',
    body: 'Share your invitation link or referral code. The link can be sent an unlimited number of times.',
  },
  {
    title: 'Your friend registers and easily uses the service.',
    body: 'Your friend must register for the first time using the link you shared and benefit from the specified paid services. Use of the paid service must be done within 24 hours of registration.',
  },
  {
    title: 'Earn together with your friend',
    body: 'Once all eligibility requirements are confirmed, you will receive a bonus of 3.00 ₼. Your friend will also be granted 5GB of free internet.',
  },
];

export const steamAmounts = [5, 10, 25, 50] as const;
export const steamLimits = { min: 1, max: 50 } as const;

/** Formats a manat amount with two decimals, e.g. 16.21 */
export function money(value: number) {
  return value.toFixed(2);
}
