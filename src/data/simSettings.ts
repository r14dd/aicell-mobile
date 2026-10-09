/** Copy and pack data for the SIM settings sub-pages (line, line status, call forwarding, roaming). */

export const lineSettingsText = {
  statusTitle: 'Line status: Open',
  statusSub: 'Line activation/suspension at subscriber’s request',
  mobileInternet: 'Mobile internet',
  internetSettingsLink: 'Request automatic internet settings',
  secondLine: 'Second line',
  secondLineSub: 'With call holding you can hold the first caller on the line and answer the second call',
  callForwarding: 'Call forwarding',
  callForwardingStatus: 'Status: Off',
};

export const lineStatusText = {
  title: 'Line status: Open',
  generalLabel: 'General information',
  general: 'You can activate or suspend your line upon request. The line can be closed for a maximum of 90 days',
  detailsLabel: 'Service details',
  feeLabel: 'Line closure fee',
  fee: 20,
  suspendedBefore: 'Your line can be suspended until ',
  suspendedDate: '23 January 2027',
  suspendedAfter: '. On completion of the respective date:',
  consequences: [
    'Your agreement will be automatically terminated',
    'Your line will be completely deactivated',
    'Remaining balance will be lost',
    'The number may be reassigned to another person',
  ],
  closeLine: 'Close line',
};

export type ForwardingKey = 'all' | 'unanswered' | 'busy' | 'unreachable';

export const forwardingRows: { key: ForwardingKey; label: string }[] = [
  { key: 'all', label: 'All calls' },
  { key: 'unanswered', label: 'When calls are not answered' },
  { key: 'busy', label: 'When line is busy' },
  { key: 'unreachable', label: 'When the phone is switched off or out of the area' },
];

export type RoamingPack = { id: string; name: string; sub: string; price: number };

export const roamingPacks: RoamingPack[] = [
  { id: 'r-500mb', name: '500 MB', sub: '3 days', price: 10 },
  { id: 'r-2gb', name: '2 GB', sub: '10 days', price: 25 },
  { id: 'r-5gb', name: '5 GB', sub: '30 days', price: 50 },
  { id: 'r-10gb', name: '10 GB', sub: '30 days', price: 75 },
];

export const roamingText = {
  title: 'Roaming',
  searchTitle: 'Search for country pricing',
  searchPlaceholder: 'Explore countries and tariffs',
  packsTitle: 'Roaming packs',
  sheetTitle: 'You are not yet in the roaming area',
  sheetBody: 'Roaming internet pack is activated immediately after purchasing. Are you sure you want to proceed?',
  decline: 'No, thanks',
  confirm: 'Yes, activate the pack',
};
