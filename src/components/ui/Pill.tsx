import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { colors, font, radius } from '@/theme/tokens';

type Props = {
  label: string;
  tone?: 'soft' | 'outline' | 'glass';
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Small status / attribute pill: "MY TARIFF", "NEW", "10 GB". */
export function Pill({ label, tone = 'outline', icon, style }: Props) {
  const soft = tone === 'soft';
  return (
    <View
      style={[
        styles.base,
        soft && styles.soft,
        tone === 'outline' && styles.outline,
        tone === 'glass' && styles.glass,
        style,
      ]}>
      {icon}
      <AppText
        style={[
          soft ? styles.softText : styles.text,
        ]}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  soft: { backgroundColor: colors.accentSoft },
  outline: { borderWidth: 1, borderColor: colors.accentIcon },
  glass: { backgroundColor: colors.glass },
  text: { fontFamily: font.medium, fontSize: 13, lineHeight: 16, color: colors.text },
  softText: { fontFamily: font.bold, fontSize: 11, lineHeight: 14, letterSpacing: 0.4, color: colors.accent },
});
