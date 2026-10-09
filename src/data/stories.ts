import { img } from '@/data/assets';

export type StoryItem = { title: string; sub: string; price: string };

/** Icons the story renderer can draw; the renderer maps each key to its Phosphor component. */
export type IconKey = 'BookOpen' | 'CalendarBlank' | 'Copy' | 'Diamond' | 'FilmSlate' | 'MusicNotes' | 'Plus';

/** Glass card with a round mark on one side: an icon on `color`, or a brand `monogram`. */
export type StoryBullet = { icon?: IconKey; color?: string; monogram?: { label: string; color: string }; text: string };

/** App row: a brand mark (letters or icon on `color`), name, one-line description and an optional price. */
export type StoryBrand = {
  name: string;
  sub: string;
  price?: string;
  /** Shows "From" above the price. */
  from?: boolean;
  monogram?: string;
  icon?: IconKey;
  color: string;
  /** Colour of the monogram or icon, white when omitted. */
  ink?: string;
};

export type StoryRow = { icon: IconKey; text: string };

export type StoryPage = {
  title: string;
  subtitle?: string;
  /** Second subtitle line; the first line turns bold when it is set. */
  subtitle2?: string;
  /** Small pill above the title, e.g. the Wolt+ mark. */
  kicker?: string;
  image?: number;
  items?: StoryItem[];
  bullets?: StoryBullet[];
  brands?: StoryBrand[];
  rows?: StoryRow[];
  /** Bold line under the art. */
  caption?: string;
  /** Raster between the subtitle and the CTA; fills the free height unless `artHeight` is set. */
  art?: number;
  artHeight?: number;
  artAlign?: 'left';
  /** Where a fixed-height art sits relative to the lists; default above. */
  artPosition?: 'above' | 'below';
  /** Photo pinned to the lower part of the page, behind everything. */
  photo?: number;
  /** The Hot tariffs offers from `hotTariffs` as stacked glass cards, in place of `items`. */
  tariffCards?: true;
  /** Gift box raster that pops up under the art after a short delay, holds, then shrinks away. */
  gift?: number;
  /** `items` / `brands` as one card with dividers instead of separate floating cards. */
  grouped?: boolean;
  /** Background gradient runs left to right instead of top to bottom. */
  horizontal?: boolean;
  cta: string;
  /** Where the CTA goes when the server names a destination; otherwise `note` is shown. */
  href?: string;
  /** How long the page stays up; the viewer's default applies when omitted. */
  durationMs?: number;
  /** Shown when the CTA's destination was not part of the reference recording. */
  note: string;
  gradient: readonly [string, string, ...string[]];
  /** Subtitle gets the flame mark, as in the app. */
  hot?: boolean;
};

export type Story = { key: string; title: string; thumb: number; pages: StoryPage[] };

const dark = ['#2B1C60', '#120B2A', '#070410'] as const;

/** Rasters cropped from the reference recordings for the Roaming, Applications, Dark Mode, 30 il, Especially and Gift Wheel stories. */
const pics = {
  yandexNote: require('@/assets/images/ref/story-yandex-note.png'),
  litresBooks: require('@/assets/images/ref/story-litres-books.png'),
  darkPhones: require('@/assets/images/ref/story-dark-phones.png'),
  darkNight: require('@/assets/images/ref/story-dark-night.png'),
  darkHome: require('@/assets/images/ref/story-dark-home.png'),
  diamonds: require('@/assets/images/ref/story-30il-diamonds.png'),
  prizes: require('@/assets/images/ref/story-30il-prizes.png'),
  lights: require('@/assets/images/ref/story-esp-lights.png'),
  sky: require('@/assets/images/ref/story-esp-sky.png'),
  giftBox: require('@/assets/images/ref/story-gift-box.png'),
} as const;

const darkGradient = ['#7137D2', '#7A37D5', '#8337D8'] as const;
const lotteryGradient = ['#A03CC0', '#8020C2', '#47068C'] as const;

const appsNote = 'The apps page is not part of this prototype yet';
const exploreNote = 'App settings are not part of this prototype yet';
const joinNote = 'Joining the lottery is not part of this prototype yet';

/** Stories seen in the reference recording. Chips without one show a notice instead. */
export const stories: Record<string, Story> = {
  'gift-wheel': {
    key: 'gift-wheel',
    title: 'Gift Wheel',
    thumb: img.chipGiftWheel,
    pages: [
      {
        title: 'Spin! Win! Repeat!',
        image: img.storyWheel,
        gift: pics.giftBox,
        cta: 'Spin now!',
        note: 'Spinning the Gift Wheel is not part of this prototype yet',
        gradient: ['#7A5BF0', '#6C8CF4', '#5BB6F6'],
      },
    ],
  },
  wolt: {
    key: 'wolt',
    title: 'Wolt+',
    thumb: img.chipWolt,
    pages: [
      {
        kicker: 'Wolt+',
        title: 'Exclusive offer!',
        subtitle: 'Wolt+ is FREE for 3 months for first-time users!',
        image: img.storyWolt,
        cta: 'Learn more',
        note: 'Wolt+ offer details are not part of this prototype yet',
        gradient: ['#6446E4', '#8B74EE', '#A99BF5'],
      },
    ],
  },
  especially: {
    key: 'especially',
    title: 'Especially for you',
    thumb: img.chipEspecially,
    pages: [
      {
        title: 'Hot offers on tariffs',
        subtitle: 'Tariff packs that suits you',
        hot: true,
        tariffCards: true,
        cta: 'View all tariffs',
        note: 'The full tariff list is not part of this prototype yet',
        gradient: dark,
      },
      {
        title: 'Always be online',
        subtitle: 'The best offers for internet packs',
        hot: true,
        items: [
          { title: '3 GB', sub: '28 days', price: '9.00' },
          { title: '350 MB', sub: '24 hours', price: '0.99' },
          { title: '1 hour', sub: 'Unlimited Speed', price: '0.99' },
          { title: '6 GB', sub: '29 days', price: '12.00' },
        ],
        photo: pics.lights,
        cta: 'View internet packs',
        note: 'The internet packs page is not part of this prototype yet',
        gradient: ['#3A1E6E', '#1A0F3A', '#0A0616'],
      },
      {
        title: 'Stay connected in roaming',
        subtitle: 'The best offers for roaming packs',
        hot: true,
        items: [
          { title: '10 GB', sub: '30 days', price: '75.00' },
          { title: '5 GB', sub: '30 days', price: '50.00' },
          { title: '2 GB', sub: '20 days', price: '25.00' },
          { title: '500 MB', sub: '3 days', price: '10.00' },
        ],
        grouped: true,
        photo: pics.sky,
        cta: 'View roaming packs',
        note: 'The roaming packs page is not part of this prototype yet',
        gradient: dark,
      },
    ],
  },
  roaming: {
    key: 'roaming',
    title: 'Roaming',
    thumb: img.chipRoaming,
    pages: [
      {
        title: 'Stay connected in roaming',
        subtitle: 'The best offers for roaming packs',
        hot: true,
        items: [
          { title: '10 GB', sub: '30 days', price: '75.00' },
          { title: '5 GB', sub: '30 days', price: '50.00' },
          { title: '2 GB', sub: '10 days', price: '25.00' },
          { title: '500 MB', sub: '3 days', price: '10.00' },
        ],
        grouped: true,
        cta: 'View roaming packs',
        note: 'The roaming packs page is not part of this prototype yet',
        gradient: ['#6E4E94', '#5C5A9E', '#4C6BA8'],
      },
    ],
  },
  applications: {
    key: 'applications',
    title: 'Applications',
    thumb: img.chipApplications,
    pages: [
      {
        title: 'Organize all your app subscriptions',
        subtitle: 'The best apps for you',
        hot: true,
        brands: [
          { name: 'Kinon', sub: 'Video streaming service', price: '3.99', from: true, monogram: 'K', color: '#1A1A1A' },
          { name: 'Yandex Plus', sub: 'Movies & podcasts', price: '3.99', monogram: 'Y+', color: '#3E62F2' },
          { name: 'Litres', sub: 'Digital books service', price: '0.15', from: true, monogram: 'L', color: '#F26A1B' },
        ],
        cta: 'View all apps',
        note: appsNote,
        gradient: ['#9C6FE6', '#8A7DE8', '#708CE9'],
        horizontal: true,
      },
      {
        title: 'Kinon: Watch the world with us',
        subtitle: 'More than 260 TV channels simultaneous on different devices',
        bullets: [
          { icon: 'Copy', color: '#AB2AD0', text: 'Flexible packages for every taste and age' },
          { icon: 'FilmSlate', color: '#2C4CC0', text: 'Movies, TV series, and shows - all in one subscription' },
          { monogram: { label: 'kin:on', color: '#1A1A1A' }, text: 'With a Kinon Plus subscription, get 5 GB of data and a 7-day trial for free!' },
        ],
        cta: 'View all apps',
        note: appsNote,
        gradient: ['#A168E7', '#AC63E6', '#B45FE3'],
        horizontal: true,
      },
      {
        title: 'Yandex Plus unites the interests!',
        subtitle: 'Get 3 services in 1 subscription',
        brands: [
          { name: 'Yandex Music', sub: 'Tracks, playlists and podcasts', icon: 'MusicNotes', color: '#FFCC00', ink: '#000000' },
          { name: 'Kinopoisk', sub: 'High quality movies and series without ads', monogram: 'K', color: '#FF6600' },
          { name: 'Yandex Books', sub: 'E-books and audio books in various genres', icon: 'BookOpen', color: '#2B2B2B' },
        ],
        grouped: true,
        art: pics.yandexNote,
        artHeight: 96,
        artAlign: 'left',
        artPosition: 'below',
        cta: 'View all apps',
        note: appsNote,
        gradient: ['#5D2E88', '#793486', '#963F85'],
      },
      {
        title: 'Litres: Thousands of books in 1 click!',
        subtitle: 'Take advantage of the wealthiest and most extensive online library',
        // The three purple tags (50,000 audiobooks, 140,000 e-books, Original content) are part of this raster.
        photo: pics.litresBooks,
        cta: 'View all apps',
        note: appsNote,
        gradient: ['#011519', '#02181C'],
      },
    ],
  },
  'dark-mode': {
    key: 'dark-mode',
    title: 'Dark Mode',
    thumb: img.chipDarkMode,
    pages: [
      {
        title: 'Meet the dark mode!',
        subtitle: 'Go to settings, set up dark mode and enjoy the benefits right now',
        art: pics.darkPhones,
        cta: 'Explore',
        note: exploreNote,
        gradient: darkGradient,
        horizontal: true,
      },
      {
        title: 'Dark mode is perfect for night sessions',
        photo: pics.darkNight,
        cta: 'Explore',
        note: exploreNote,
        gradient: ['#342E52', '#383258', '#3E355C'],
      },
      {
        title: 'Experience the magic of dark mode!',
        art: pics.darkHome,
        cta: 'Explore',
        note: exploreNote,
        gradient: darkGradient,
        horizontal: true,
      },
    ],
  },
  '30il': {
    key: '30il',
    title: '“30 il səninlə”',
    thumb: img.chip30il,
    pages: [
      {
        title: 'Are you ready to join the lottery?',
        subtitle: 'We’re launching the “30 il səninlə” lottery to celebrate our 30 years with you!',
        art: pics.diamonds,
        cta: 'Join now',
        note: joinNote,
        gradient: lotteryGradient,
      },
      {
        title: 'Amazing prizes are waiting for you!',
        subtitle: 'An apartment in the city centre',
        subtitle2: 'Mega prize',
        art: pics.prizes,
        caption: 'Toyota Corolla Cross 2026 & iPhone 17 Pro',
        cta: 'Join now',
        note: joinNote,
        gradient: lotteryGradient,
      },
      {
        title: 'Get ready to collect your chances!',
        subtitle: 'Starting from 19 October, you can earn chances through the following activities:',
        rows: [
          { icon: 'Plus', text: 'Top up your balance with 5 AZN or more' },
          { icon: 'Diamond', text: 'Get chance packs' },
          { icon: 'CalendarBlank', text: 'Complete weekly tasks' },
        ],
        cta: 'Join now',
        note: joinNote,
        gradient: lotteryGradient,
      },
    ],
  },
};
