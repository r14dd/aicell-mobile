import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Tap } from '@/components/ui/Tap';
import { colors } from '@/theme/tokens';

// 79x40 px in the 576-wide recording: 54x27 pt
const W = 54;
const H = 27;
const KNOB = 21;
const PAD = 3;

type Props = { value: boolean; onChange: (next: boolean) => void; accessibilityLabel: string; disabled?: boolean };

/** The app's switch: purple track with a white knob when on, dark track when off. */
export function Toggle({ value, onChange, accessibilityLabel, disabled }: Props) {
  const t = useSharedValue(value ? 1 : 0);
  useEffect(() => {
    t.value = withTiming(value ? 1 : 0, { duration: 180, easing: Easing.out(Easing.cubic) });
  }, [value, t]);
  const knob = useAnimatedStyle(() => ({ transform: [{ translateX: PAD + t.value * (W - KNOB - PAD * 2) }] }));
  return (
    <Tap
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      pressScale={0.96}
      onPress={() => onChange(!value)}
      style={[styles.track, { backgroundColor: value ? colors.accent : '#4C435C' }]}>
      <Animated.View style={[styles.knob, knob]} />
    </Tap>
  );
}

const styles = StyleSheet.create({
  track: { width: W, height: H, borderRadius: H / 2, justifyContent: 'center' },
  knob: { width: KNOB, height: KNOB, borderRadius: KNOB / 2, backgroundColor: '#FFFFFF' },
});
