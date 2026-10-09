import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { colors, radius } from '@/theme/tokens';

/** Status pill on service pages ("AUTO-RENEWAL", "ACTIVATED"): lilac to blue, measured from the recording. */
export function GradientPill({ label, style }: { label: string; style?: StyleProp<ViewStyle> }) {
  return (
    <LinearGradient colors={['#8F7EFF', '#4B70E5']} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={[styles.pill, style]}>
      <AppText variant="label" style={styles.text}>
        {label}
      </AppText>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  pill: { alignSelf: 'flex-start', borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 5 },
  text: { color: colors.text, fontSize: 10, lineHeight: 14, letterSpacing: 0.4 },
});
