import { StyleSheet, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp, LinearTransition } from 'react-native-reanimated';

import { AppText } from '@/components/ui/AppText';
import { colors, font } from '@/theme/tokens';

/** The mascot's speech pill: stretches to fit and rolls new words up, like the "Need help?" pill in the top bar. */
export function SpeechPill({ text, tone = 'solid' }: { text: string; tone?: 'solid' | 'glass' }) {
  return (
    <Animated.View layout={LinearTransition.springify().damping(18).stiffness(180)} style={[styles.pill, tone === 'glass' && styles.glass]}>
      <View style={styles.clip}>
        <Animated.View key={text} entering={FadeInUp.duration(220)} exiting={FadeOutUp.duration(160)}>
          <AppText style={styles.text} numberOfLines={6}>
            {text}
          </AppText>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pill: { minHeight: 44, maxWidth: 320, paddingHorizontal: 20, paddingVertical: 11, borderRadius: 22, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  glass: { backgroundColor: colors.glass },
  clip: { overflow: 'hidden' },
  text: { fontFamily: font.medium, fontSize: 16, lineHeight: 22, color: colors.text, textAlign: 'center' },
});
