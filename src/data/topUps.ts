export type TopUp = { id: string; date: string; time: string; amount: number };

/** Top-up history from the recording, newest first. */
export const topUps: TopUp[] = [
  { id: 'h01', date: '02 October 2026', time: '16:39', amount: 15 },
  { id: 'h02', date: '02 October 2026', time: '16:34', amount: 1 },
  { id: 'h03', date: '24 September 2026', time: '08:23', amount: 1 },
  { id: 'h04', date: '24 September 2026', time: '08:22', amount: 19 },
  { id: 'h05', date: '03 September 2026', time: '15:37', amount: 19 },
  { id: 'h06', date: '07 August 2026', time: '11:57', amount: 19 },
  { id: 'h07', date: '14 July 2026', time: '15:15', amount: 19 },
  { id: 'h08', date: '19 June 2026', time: '10:32', amount: 13 },
  { id: 'h09', date: '19 June 2026', time: '10:30', amount: 7.94 },
  { id: 'h10', date: '21 May 2026', time: '17:18', amount: 13 },
  { id: 'h11', date: '18 May 2026', time: '16:11', amount: 10 },
  { id: 'h12', date: '07 May 2026', time: '07:54', amount: 19.1 },
  { id: 'h13', date: '28 April 2026', time: '12:30', amount: 5 },
  { id: 'h14', date: '23 April 2026', time: '09:24', amount: 3 },
  { id: 'h15', date: '23 April 2026', time: '09:20', amount: 16 },
];
