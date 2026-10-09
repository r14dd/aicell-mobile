import { StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';

import { colors, font } from '@/theme/tokens';

export type TextVariant =
  | 'display'
  | 'title'
  | 'heading'
  | 'subheading'
  | 'body'
  | 'bodyMedium'
  | 'bodySemibold'
  | 'caption'
  | 'captionMedium'
  | 'small'
  | 'label';

export type TextTone =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'accent'
  | 'link'
  | 'green'
  | 'red'
  | 'info'
  | 'onHeaderSecondary';

const toneColor: Record<TextTone, string> = {
  primary: colors.text,
  secondary: colors.textSecondary,
  tertiary: colors.textTertiary,
  accent: colors.accent,
  link: colors.accentLink,
  green: colors.green,
  red: colors.red,
  info: colors.info,
  onHeaderSecondary: colors.onHeaderSecondary,
};

type Props = TextProps & { variant?: TextVariant; tone?: TextTone };

export function AppText({ variant = 'body', tone = 'primary', style, ...rest }: Props) {
  return <Text {...rest} style={[styles[variant], { color: toneColor[tone] }, style]} />;
}

export const textStyles = StyleSheet.create({
  display: { fontFamily: font.bold, fontSize: 30, lineHeight: 36, letterSpacing: -0.6 },
  title: { fontFamily: font.bold, fontSize: 22, lineHeight: 28, letterSpacing: -0.4 },
  heading: { fontFamily: font.semibold, fontSize: 19, lineHeight: 25, letterSpacing: -0.3 },
  subheading: { fontFamily: font.medium, fontSize: 17, lineHeight: 23, letterSpacing: -0.2 },
  body: { fontFamily: font.regular, fontSize: 15, lineHeight: 21 },
  bodyMedium: { fontFamily: font.medium, fontSize: 15, lineHeight: 21 },
  bodySemibold: { fontFamily: font.semibold, fontSize: 15, lineHeight: 21 },
  caption: { fontFamily: font.regular, fontSize: 13, lineHeight: 18 },
  captionMedium: { fontFamily: font.medium, fontSize: 13, lineHeight: 18 },
  small: { fontFamily: font.regular, fontSize: 12, lineHeight: 16 },
  label: { fontFamily: font.bold, fontSize: 11, lineHeight: 14, letterSpacing: 0.4 },
});

const styles = textStyles;

/** Money and counters: tabular numerals so columns line up. */
export const tabular: TextStyle = { fontVariant: ['tabular-nums'] };
