export const colors = {
  bg: '#000000',
  card: '#1E1A29',
  cardRaised: '#2A2438',
  cardIndigo: '#4A4286',
  line: 'rgba(255,255,255,0.08)',
  lineStrong: 'rgba(255,255,255,0.18)',
  text: '#FFFFFF',
  textSecondary: '#B9B3C9',
  textTertiary: '#8A8399',
  onHeaderSecondary: '#DDD6F3',
  accent: '#7B41E8',
  accentPressed: '#6B35D2',
  accentSoft: '#E8D3FC',
  accentLink: '#B794F6',
  accentIcon: '#9F7BEA',
  headerTop: '#312C72',
  headerMid: '#3F2B85',
  headerBottom: '#4B2F9C',
  glass: 'rgba(255,255,255,0.16)',
  glassStrong: 'rgba(255,255,255,0.26)',
  chipRing: 'rgba(125,230,212,0.9)',
  magentaA: '#C244CF',
  magentaB: '#E25BC8',
  green: '#62C45A',
  red: '#E8445F',
  blue: '#4A6AE0',
  info: '#5AB0E8',
  orange: '#FF8A3D',
  disabledBg: '#3B3450',
  disabledText: '#A39BB3',
  tabBar: '#1C1829',
  tabInactive: '#B3AEC2',
  noteBg: '#E6D8FC',
} as const;

export const font = {
  regular: 'Geist_400Regular',
  medium: 'Geist_500Medium',
  semibold: 'Geist_600SemiBold',
  bold: 'Geist_700Bold',
} as const;

export const radius = { sm: 10, md: 12, lg: 14, xl: 20, pill: 999 } as const;
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 } as const;
export const layout = {
  gutter: 18,
  tabBarHeight: 54,
  fabLift: 16,
  maxWidth: 430,
} as const;

export const headerGradient = [colors.headerTop, colors.headerMid, colors.headerBottom] as const;
export const ctaGradient = ['#7240DD', '#8A36D8'] as const;
export const lotteryGradient = [colors.magentaA, colors.magentaB] as const;
