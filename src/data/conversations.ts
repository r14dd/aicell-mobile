export type ChatTurn = { role: 'user' | 'aysel'; text: string; at: string };
export type Conversation = { id: string; startedAt: string; turns: ChatTurn[] };

/** Past talks with AIsel. UI only until the backend keeps a history; `startedAt` is ISO local time. */
export const pastConversations: Conversation[] = [
  {
    id: 'c-2026-10-09-1136',
    startedAt: '2026-10-09T11:36:00',
    turns: [
      { role: 'user', text: 'Balansımı 5 manat artır', at: '2026-10-09T11:36:04' },
      { role: 'aysel', text: 'Balansınızı 5 manat artırıram.', at: '2026-10-09T11:36:12' },
      { role: 'aysel', text: 'Hazırdır. Balansınız 21.21 manatdır.', at: '2026-10-09T11:36:41' },
    ],
  },
  {
    id: 'c-2026-10-09-0958',
    startedAt: '2026-10-09T09:58:00',
    turns: [
      { role: 'user', text: 'Nə qədər internetim qalıb?', at: '2026-10-09T09:58:03' },
      { role: 'aysel', text: 'Sizin 20 GB-dan 7.2 GB internetiniz və 30 dəqiqədən 30 dəqiqəniz qalıb.', at: '2026-10-09T09:58:11' },
    ],
  },
  {
    id: 'c-2026-10-08-1840',
    startedAt: '2026-10-08T18:40:00',
    turns: [
      { role: 'user', text: 'Rouminqi aç', at: '2026-10-08T18:40:02' },
      { role: 'aysel', text: 'Rouminq tənzimləmələrini açıram.', at: '2026-10-08T18:40:09' },
    ],
  },
  {
    id: 'c-2026-10-08-1215',
    startedAt: '2026-10-08T12:15:00',
    turns: [
      { role: 'user', text: 'Balansım nə qədərdir?', at: '2026-10-08T12:15:05' },
      { role: 'aysel', text: 'Balansınız 16.21 manatdır.', at: '2026-10-08T12:15:12' },
    ],
  },
  {
    id: 'c-2026-10-07-2102',
    startedAt: '2026-10-07T21:02:00',
    turns: [
      { role: 'user', text: 'Tarifimi göstər', at: '2026-10-07T21:02:03' },
      { role: 'aysel', text: 'Tarifinizi açıram.', at: '2026-10-07T21:02:10' },
    ],
  },
];

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const dayKey = (d: Date) => d.getFullYear() * 10000 + d.getMonth() * 100 + d.getDate();

/** "Today", "Yesterday" or "7 October". */
export function dayLabel(iso: string, now = new Date()) {
  const d = new Date(iso);
  const diff = dayKey(now) - dayKey(d);
  if (diff === 0) return 'Today';
  if (diff === 1 || (diff > 1 && now.getTime() - d.getTime() < 2 * 86400000 && now.getDate() - d.getDate() === 1)) return 'Yesterday';
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export const clock = (iso: string) => new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
