import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Tap } from '@/components/ui/Tap';
import { colors, ctaGradient, font, radius } from '@/theme/tokens';

type Variant = 'primary' | 'outline' | 'glass' | 'gradient' | 'soft';
type Size = 'sm' | 'md' | 'lg';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

const heights: Record<Size, number> = { sm: 36, md: 44, lg: 52 };
const fontSizes: Record<Size, number> = { sm: 14, md: 15, lg: 16 };
const paddings: Record<Size, number> = { sm: 16, md: 20, lg: 24 };

export function Button({ label, onPress, variant = 'primary', size = 'md', disabled, icon, style, accessibilityLabel }: Props) {
  const textColor =
    disabled ? colors.disabledText
    : variant === 'outline' ? colors.accentLink
    : variant === 'soft' ? colors.accent
    : colors.text;

  const content = (
    <View style={styles.row}>
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <AppText
        numberOfLines={1}
        style={{ fontFamily: font.semibold, fontSize: fontSizes[size], lineHeight: fontSizes[size] + 6, color: textColor }}>
        {label}
      </AppText>
    </View>
  );

  const base: ViewStyle = {
    height: heights[size],
    paddingHorizontal: paddings[size],
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  };

  const fill: ViewStyle =
    disabled ? { backgroundColor: colors.disabledBg }
    : variant === 'primary' ? { backgroundColor: colors.accent }
    : variant === 'outline' ? { borderWidth: 1.5, borderColor: colors.accent, backgroundColor: 'transparent' }
    : variant === 'glass' ? { backgroundColor: colors.glassStrong }
    : variant === 'soft' ? { backgroundColor: colors.accentSoft }
    : {};

  return (
    <Tap onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={accessibilityLabel ?? label} style={style}>
      {variant === 'gradient' && !disabled ? (
        <LinearGradient colors={ctaGradient} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={base}>
          {content}
        </LinearGradient>
      ) : (
        <View style={[base, fill]}>{content}</View>
      )}
    </Tap>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  icon: { marginRight: 2 },
});
