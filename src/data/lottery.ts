export const lotteryIcons = ['Diamond', 'Clock', 'Trophy', 'Gift', 'Medal', 'Calendar', 'Users', 'Info'] as const;
export type LotteryIcon = (typeof lotteryIcons)[number];

export type LotteryBlock =
  | { kind: 'p'; text: string; bold?: string; num?: string }
  | { kind: 'example'; items: string[] }
  | { kind: 'bullets'; items: string[] }
  | { kind: 'note'; items: string[] }
  | { kind: 'link'; before: string; link: string; after: string };

export type LotterySection = { icon?: LotteryIcon; title: string; blocks: LotteryBlock[] };

/** Rules text of the "30 il səninlə" lottery. `bold` is the lead-in that precedes `text`; `num` is a hanging list number. */
export const lotterySections: LotterySection[] = [
  {
    title: 'About the lottery',
    blocks: [
      {
        kind: 'p',
        text: 'We are launching the stimulating lottery called "30 il səninlə"!\nWin one of the magnificent prizes, including an apartment in the city center, Toyota Corolla Cross cars, and iPhone 17 Pro smartphones!',
      },
      { kind: 'p', text: "Join the lottery and don't miss your chance to win!" },
    ],
  },
  {
    icon: 'Diamond',
    title: 'How to earn chances?',
    blocks: [
      {
        kind: 'p',
        num: '1.',
        bold: 'Top up your balance with 5 AZN or more',
        text: 'and get 1 chance for every 1 AZN. Top-ups below 5 AZN do not grant chances. Chances are added to your account after a successful top-up.',
      },
      { kind: 'example', items: ['10 AZN balance top-up = 10 chances', 'Balance under 5 AZN = 0 chances'] },
      {
        kind: 'p',
        num: '2.',
        bold: 'Spend more, get more chances.',
        text: 'Every 1 AZN spent on eligible products and services gives you 1 chance. When you spend more than 5 AZN on appropriate products and services, you can earn double chances.',
      },
      { kind: 'example', items: ['10 AZN spent on eligible products and services = 20 chances', '4 AZN spent = 4 chances'] },
      {
        kind: 'p',
        num: '3.',
        bold: 'Buy chance packs.',
        text: 'Activate one of the 5 available chance packages to win on-net minutes and extra chances.',
      },
      { kind: 'p', num: '4.', bold: 'Complete weekly tasks', text: 'and get 5x chances.' },
      {
        kind: 'p',
        text: 'The more chances you collect, the higher your participation chances and the opportunity to win a prize in the lottery!',
      },
    ],
  },
  {
    icon: 'Clock',
    title: 'When are chances added?',
    blocks: [
      {
        kind: 'p',
        text: 'Chances are added to your lottery balance after the transaction is processed. Your balance may not update immediately. Please take into account the processing time required for earned new chances to appear in the app.',
      },
      {
        kind: 'p',
        text: 'Chances earned from eligible products and services may take up to 1 day to appear in your balance.',
      },
      { kind: 'p', text: 'You can check your current chance balance at any time from the lottery page.' },
    ],
  },
  {
    icon: 'Trophy',
    title: 'How is the winner chosen?',
    blocks: [
      {
        kind: 'p',
        text: 'Winners are determined by a random selection method from all eligible chances collected during the lottery period.',
      },
      {
        kind: 'p',
        text: 'Each chance means an additional opportunity to participate in the draw. In other words, the more chances you have, the higher your probability of winning.',
      },
      {
        kind: 'p',
        bold: 'Daily chances reset every day, and weekly chances reset every week.',
        text: 'These chances participate in daily and weekly draws accordingly. After each daily or weekly draw, the chances used in that draw are cleared, but all chances that did not win remain active to participate in the Mega prize - apartment draw.',
      },
      { kind: 'p', text: 'More chances = more opportunities to win!' },
    ],
  },
  {
    icon: 'Gift',
    title: 'What prizes can you win?',
    blocks: [
      { kind: 'p', text: 'The lottery offers magnificent prizes:' },
      {
        kind: 'bullets',
        items: ['Mega Prize - an apartment in the city center', 'Toyota Corolla Cross cars', 'iPhone 17 Pro smartphones'],
      },
    ],
  },
  {
    icon: 'Medal',
    title: 'When are winners announced?',
    blocks: [
      {
        kind: 'p',
        text: 'Winners will be announced in a live broadcast and notified via our official communication channels.',
      },
    ],
  },
  {
    title: 'Important information',
    blocks: [
      {
        kind: 'note',
        items: [
          'Only chances earned as a result of eligible transactions are considered.',
          'Having chances does not guarantee winning a prize. Winners are determined by random selection.',
          'The more chances you earn, the greater your opportunity to win a prize.',
          'Only the registered number owner aged 18 or above is eligible to claim the prize.',
        ],
      },
      {
        kind: 'link',
        before: 'Detailed information about the lottery terms is available via ',
        link: 'link',
        after: '.',
      },
    ],
  },
];
