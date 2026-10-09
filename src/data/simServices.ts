/** Copy and numbers for the SIM settings pages: SMS settings, PUK codes, Services and service details. */

export type Segment = { text: string; bold?: boolean };

// SMS settings

export type SmsLanguageId = 'az' | 'en' | 'ru';
export type SmsToggleId = 'ads' | 'campaigns' | 'partners';

export const smsCopy = {
  title: 'SMS settings',
  fromAzercell: 'SMS from Azercell',
  fromPartners: 'SMS from partners',
  languageLabel: 'SMS language',
  sheetTitle: 'Choose language',
};

export const smsLanguages: { id: SmsLanguageId; name: string }[] = [
  { id: 'az', name: 'Azerbaijani' },
  { id: 'en', name: 'English' },
  { id: 'ru', name: 'Russian' },
];

export const smsToggles: { id: SmsToggleId; label: string; sub: string; group: 'azercell' | 'partners' }[] = [
  { id: 'ads', label: 'Azercell’s SMS ads', sub: 'Receive updates for tariffs, packs and bonuses', group: 'azercell' },
  { id: 'campaigns', label: 'Azercell campaigns', sub: 'Receive news about new campaigns and their updates', group: 'azercell' },
  { id: 'partners', label: '3rd party advertisement', sub: "You'll receive advertising SMS from the 3rd party services", group: 'partners' },
];

// PUK codes

export const pukCopy = {
  title: 'PUK codes',
  heading: 'About PUK codes',
  paragraphs: [
    [
      { text: 'After 3 incorrect entries of PIN 1 and PIN 2, the codes ' },
      { text: 'will be blocked', bold: true },
      { text: '. To unlock the codes, you need to enter the relevant PUK 1 and PUK 2 codes.' },
    ],
    [
      { text: 'After 10 incorrect entries of PUK 1 and PUK 2, the ' },
      { text: 'SIM card becomes unusable', bold: true },
      { text: '. It is advisable, to replace the SIM card by contacting Azercell Customer Care.' },
    ],
  ] as Segment[][],
};

export const pukCodes = [
  { label: 'PUK 1', value: '5839 0447' },
  { label: 'PUK 2', value: '8815 4421' },
];

// Services

export type ServiceId = string;

export type ServiceSection =
  | { kind: 'text'; title: string; text: string }
  | { kind: 'rows'; title: string; rows: { label: string; value: string }[] }
  | { kind: 'option'; title: string; name: string; sub: string; price: string; id?: string };

export type ServiceAction =
  | { label: string; purchase: { amount: number; title: string; success: string; failure: string } }
  | { label: string; notice: string };

export type SimService = {
  id: ServiceId;
  name: string;
  sub: string;
  /** Outline pill on the list card. */
  period: string;
  /** Shown on the list card unless the service is activated. */
  price?: number;
  activated: boolean;
  /** Blue pill under the title on the detail page (and on the list card when activated). */
  badge: string;
  subtitle?: string;
  sections: ServiceSection[];
  action: ServiceAction;
};

export const servicesCopy = {
  title: 'Services',
  priceUnit: '₼',
};

export const services: SimService[] = [
  {
    id: 'missed-call',
    name: 'Buraxılmış zəng',
    sub: 'Get notified of missed calls',
    period: '30 days',
    price: 0.9,
    activated: false,
    badge: 'AUTO-RENEWAL',
    subtitle: 'Get notified of missed calls',
    sections: [
      {
        kind: 'text',
        title: 'General information',
        text: "You'll receive SMS about missed calls once you are back in network when the phone is switched off or out of the area",
      },
      {
        kind: 'rows',
        title: 'Buraxılmış zəng details',
        rows: [
          { label: 'Validity period', value: '30d.' },
          { label: 'Price', value: '0.90 ₼' },
        ],
      },
      {
        kind: 'option',
        title: 'Additionally:',
        name: 'Xəbər ver',
        sub: 'Notify caller when you are back in network',
        price: 'Free',
      },
    ],
    action: {
      label: 'Subscribe for 0.90 ₼',
      purchase: {
        amount: 0.9,
        title: 'Buraxılmış zəng service',
        success: 'Buraxılmış zəng subscribed for 0.90 ₼',
        failure: 'Not enough balance for this service',
      },
    },
  },
  {
    id: 'auto-balance',
    name: 'Automatic balance',
    sub: 'Display balance after each call',
    period: '30 days',
    activated: true,
    badge: 'ACTIVATED',
    sections: [
      {
        kind: 'rows',
        title: 'Service details',
        rows: [{ label: 'Validity period', value: '30d.' }],
      },
      {
        kind: 'rows',
        title: 'Payment details',
        rows: [
          { label: 'Activation date', value: '24.09.2026' },
          { label: 'Next payment date', value: '24.10.2026' },
          { label: 'Payment amount', value: '0.90 ₼' },
        ],
      },
      {
        kind: 'text',
        title: 'General information',
        text: 'With "Automatic balance information" you will automatically receive information about your balance after every call.',
      },
    ],
    action: { label: 'Deactivate', notice: 'Deactivating this service is not part of this prototype yet' },
  },
];

export const findService = (id?: string) => services.find((s) => s.id === id) ?? services[0];
