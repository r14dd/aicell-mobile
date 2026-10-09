export type Notification = { id: string; date: string; title: string; body: string; cta?: string; ctaHref?: string };

/** Surface colour of the notification screens in the reference frames (dark violet, not the black app bg). */
export const surface = '#231C2E';

export const notifications: Notification[] = [
  {
    id: 'wingz',
    date: '27 October 2025',
    title: 'Activate Wingz scooter with your Azercell balance!',
    body: 'Get 15 minutes of free time on your first ride! Send Start (scooter ID) to 4545.',
  },
  {
    id: 'gift-wheel',
    date: '31 March 2022',
    title: 'Gift Wheel🎯',
    body: '⚠️📲 The campaign will be temporarily suspended from April 1 due to technical works. Soon after the completion of the works you will be able to rejoin the campaign.👍',
  },
  {
    id: 'gift',
    date: '31 December 2021',
    title: "Don't be left without a gift! 💜🎁🎅",
    body: 'Monthly ivi, Bookmate, SberZvuk are free up to 30 days!😮 Cancel subscription anytime😊',
    cta: 'Got it',
  },
];

/** Groups items by their date label, keeping the given order. */
export function groupByDate(items: Notification[]): { date: string; items: Notification[] }[] {
  const groups: { date: string; items: Notification[] }[] = [];
  for (const item of items) {
    const group = groups.find((g) => g.date === item.date);
    if (group) group.items.push(item);
    else groups.push({ date: item.date, items: [item] });
  }
  return groups;
}
