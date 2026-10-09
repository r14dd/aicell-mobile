import { LinearGradient } from 'expo-linear-gradient';
import { useState, type ReactNode } from 'react';
import { StyleSheet, View, type GestureResponderEvent, type LayoutChangeEvent } from 'react-native';

import { Plus } from '@/components/icons';
import { AppText, tabular } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { Tap } from '@/components/ui/Tap';
import { colors } from '@/theme/tokens';

type Props = {
  icon: ReactNode;
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
};

const THUMB = 34;
const TRACK = '#4C435C';
const fillGradient = ['#5B3BE0', '#8E4DF0'] as const;
const ringGradient = ['#6A3FE6', '#9A55F2'] as const;
const glyphOn = '#9D6AEA';
const glyphOff = '#644D90';

/** Card with a +/- stepper and a draggable track: left end is the current value, right end the maximum. */
export function StepSlider({ icon, label, min, max, step, value, onChange }: Props) {
  const [width, setWidth] = useState(0);
  const usable = Math.max(0, width - THUMB);
  const ratio = max > min ? (value - min) / (max - min) : 0;
  const thumbLeft = ratio * usable;

  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  const setFromX = (x: number) => {
    if (usable <= 0) return;
    const r = Math.min(1, Math.max(0, (x - THUMB / 2) / usable));
    onChange(clamp(Math.round((min + r * (max - min) - min) / step) * step + min));
  };
  const touch = (e: GestureResponderEvent) => setFromX(e.nativeEvent.locationX);

  const bump = (dir: 1 | -1) => onChange(clamp(value + dir * step));

  return (
    <Card style={{ paddingHorizontal: 16, paddingVertical: 14 }}>
      <View style={styles.head}>
        {icon}
        <AppText variant="body" style={{ flex: 1 }}>
          {label}
        </AppText>
        <Tap
          disabled={value <= min}
          haptic={false}
          accessibilityRole="button"
          accessibilityLabel={`Decrease ${label}`}
          onPress={() => bump(-1)}
          style={styles.step}>
          <View style={[styles.minus, { backgroundColor: value <= min ? glyphOff : glyphOn }]} />
        </Tap>
        <Tap
          disabled={value >= max}
          haptic={false}
          accessibilityRole="button"
          accessibilityLabel={`Increase ${label}`}
          onPress={() => bump(1)}
          style={styles.step}>
          <Plus size={16} color={value >= max ? glyphOff : glyphOn} weight="bold" />
        </Tap>
      </View>

      <View
        style={styles.track}
        onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderTerminationRequest={() => false}
        onResponderGrant={touch}
        onResponderMove={touch}
        accessibilityRole="adjustable"
        accessibilityLabel={label}
        accessibilityValue={{ min, max, now: value }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(e) => bump(e.nativeEvent.actionName === 'increment' ? 1 : -1)}>
        {/* Children ignore touches so locationX is always relative to the track. */}
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <LinearGradient
            colors={fillGradient}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={{ width: thumbLeft + THUMB, height: THUMB, borderRadius: THUMB / 2 }}
          />
          {value < max ? (
            <AppText variant="body" style={[styles.max, tabular]}>
              {max}
            </AppText>
          ) : null}
          <LinearGradient
            colors={ringGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.thumb, { left: thumbLeft }]}>
            <View style={styles.thumbInner}>
              <AppText variant="bodySemibold" style={[{ fontSize: 14, lineHeight: 18 }, tabular]}>
                {value}
              </AppText>
            </View>
          </LinearGradient>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  step: { width: 32, height: 32, borderRadius: 16, backgroundColor: TRACK, alignItems: 'center', justifyContent: 'center', marginLeft: 2 },
  minus: { width: 12, height: 2, borderRadius: 1 },
  track: { height: THUMB, marginTop: 14, borderRadius: THUMB / 2, backgroundColor: TRACK, overflow: 'hidden' },
  max: { position: 'absolute', right: 14, top: 0, height: THUMB, lineHeight: THUMB },
  thumb: { position: 'absolute', top: 0, width: THUMB, height: THUMB, borderRadius: THUMB / 2, padding: 2.5 },
  thumbInner: { flex: 1, borderRadius: THUMB / 2, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
});
