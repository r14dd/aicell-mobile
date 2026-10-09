import { Image } from 'expo-image';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSpring, withTiming, type SharedValue } from 'react-native-reanimated';

import { img, waveFramesHd } from '@/data/assets';
import { colors } from '@/theme/tokens';

const FRAME_MS = 1000 / 30;
const WAVE_MS = waveFramesHd.length * FRAME_MS;

type Props = {
  /** Diameter of the face in points. */
  size: number;
  /** Microphone level 0..1; nudges the face while the user speaks. */
  level?: SharedValue<number>;
  mood?: 'idle' | 'listening' | 'speaking';
  /** Changing this value plays the recorded wave once. */
  waveKey?: number;
  /** Spring in from small on mount; off where the face is already in place. */
  pop?: boolean;
};

/** The Azercell mascot, as recorded: it pops in, waves with its own frames, then waits. */
export function BotOrb({ size, level, waveKey = 0, pop: popIn = true }: Props) {
  const zero = useSharedValue(0);
  const amplitude = level ?? zero;
  const pop = useSharedValue(popIn ? 0.6 : 1);
  const wave = useSharedValue(1);

  useEffect(() => {
    if (popIn) pop.value = withSpring(1, { damping: 12, stiffness: 170 });
  }, [pop, popIn]);

  useEffect(() => {
    if (!waveKey) return;
    wave.value = 0;
    wave.value = withTiming(1, { duration: WAVE_MS, easing: Easing.linear });
  }, [waveKey, wave]);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: pop.value * (1 + amplitude.value * 0.04) }] }));
  const idle = useAnimatedStyle(() => ({ opacity: wave.value >= 1 ? 1 : 0 }));

  return (
    <Animated.View style={[styles.face, { width: size, height: size, borderRadius: size / 2 }, style]}>
      <Animated.View style={[StyleSheet.absoluteFill, idle]}>
        <Image source={img.avatarRobotIdleHd} style={{ width: size, height: size }} contentFit="cover" />
      </Animated.View>
      {waveFramesHd.map((source, i) => (
        <WaveFrame key={i} index={i} source={source} size={size} wave={wave} />
      ))}
      <View pointerEvents="none" style={[styles.ring, { borderRadius: size / 2 }]} />
    </Animated.View>
  );
}

function WaveFrame({ index, source, size, wave }: { index: number; source: number; size: number; wave: SharedValue<number> }) {
  const style = useAnimatedStyle(() => ({ opacity: wave.value < 1 && Math.floor(wave.value * waveFramesHd.length) === index ? 1 : 0 }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, style]}>
      <Image source={source} style={{ width: size, height: size }} contentFit="cover" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  face: { overflow: 'hidden', backgroundColor: colors.accent },
  ring: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.22)' },
});
