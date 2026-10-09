import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { AppText } from '@/components/ui/AppText';
import { Tap } from '@/components/ui/Tap';
import { img, waveFramesHd as waveFrames } from '@/data/assets';
import { colors, font } from '@/theme/tokens';

const SIZE = 34;
const PILL = 90;
const ROLL = 34;
const WORD_ROLL = 14;
const FRAME_MS = 1000 / 30;
const WAVE_LEN = waveFrames.length * FRAME_MS;

/**
 * Timeline measured at 30 fps from recordings of the real app.
 * INTRO runs once after the app opens: mark, robot (waves), robot sinks, pill stretches left,
 * "Need" then "help?" roll upward through it, pill shrinks while the mark rises back in.
 * LOOP then repeats: mark rolls up and the robot rises in, robot idles and waves, robot sinks
 * while the mark descends from above, mark holds.
 */
const INTRO = { markOut: 800, robotIn: 1000, waveAt: 1500, sinkAt: 5200, sunk: 5400, growAt: 5550, grown: 5750, needIn: 5650, needUp: 6850, helpIn: 6850, helpUp: 8000, shrinkAt: 8100, shrunk: 8300, markIn: 8400, end: 10400 };
const LOOP = { robotIn: 200, waveAt: 700, sinkAt: 4400, sunk: 4600, end: 8800 };

const CLAMP = Extrapolation.CLAMP;
const ease = Easing.out(Easing.cubic);

/** Eased progress of `v` through [a, b]. */
function seg(v: number, a: number, b: number) {
  'worklet';
  return ease(interpolate(v, [a, b], [0, 1], CLAMP));
}

/** Sprite frame to show at this moment, or -1 for the idle pose. */
function waveIndex(mode: number, t: number, u: number) {
  'worklet';
  const start = mode === 0 ? INTRO.waveAt : LOOP.waveAt;
  const v = mode === 0 ? t : u;
  if (v >= start && v < start + WAVE_LEN) return Math.floor((v - start) / FRAME_MS);
  return -1;
}

export function AvatarButton() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const mode = useSharedValue(0);
  const t = useSharedValue(0);
  const u = useSharedValue(0);

  useEffect(() => {
    if (reduce) {
      mode.value = 1;
      u.value = LOOP.end;
      return;
    }
    mode.value = 0;
    u.value = 0;
    t.value = 0;
    t.value = withTiming(INTRO.end, { duration: INTRO.end, easing: Easing.linear }, (finished) => {
      if (!finished) return;
      mode.value = 1;
      u.value = 0;
      u.value = withRepeat(withTiming(LOOP.end, { duration: LOOP.end, easing: Easing.linear }), -1, false);
    });
    return () => {
      cancelAnimation(t);
      cancelAnimation(u);
    };
  }, [reduce, mode, t, u]);

  const pill = useAnimatedStyle(() => {
    if (mode.value !== 0) return { width: SIZE };
    const open = seg(t.value, INTRO.growAt, INTRO.grown) - seg(t.value, INTRO.shrinkAt, INTRO.shrunk);
    return { width: SIZE + (PILL - SIZE) * open };
  });

  const robot = useAnimatedStyle(() => {
    if (mode.value === 0) {
      const v = t.value;
      const rise = seg(v, INTRO.markOut, INTRO.robotIn);
      const sink = seg(v, INTRO.sinkAt, INTRO.sunk);
      return { opacity: rise - sink, transform: [{ translateY: ROLL * (1 - rise) + ROLL * sink }] };
    }
    const v = u.value;
    const rise = seg(v, 0, LOOP.robotIn);
    const sink = seg(v, LOOP.sinkAt, LOOP.sunk);
    return { opacity: rise - sink, transform: [{ translateY: ROLL * (1 - rise) + ROLL * sink }] };
  });

  const mark = useAnimatedStyle(() => {
    if (mode.value === 0) {
      const v = t.value;
      const out = seg(v, INTRO.markOut, INTRO.robotIn);
      const back = seg(v, INTRO.shrunk, INTRO.markIn);
      // rolls up and out at the start; rises back in from below once the pill has shrunk
      return { opacity: 1 - out + back, transform: [{ translateY: back > 0 ? ROLL * (1 - back) : -ROLL * out }] };
    }
    const v = u.value;
    const out = seg(v, 0, LOOP.robotIn);
    const down = seg(v, LOOP.sinkAt, LOOP.sunk);
    // rolls up and out as the robot rises; descends from above while the robot sinks
    return { opacity: 1 - out + down, transform: [{ translateY: down > 0 ? -ROLL * (1 - down) : -ROLL * out }] };
  });

  const need = useAnimatedStyle(() => {
    if (mode.value !== 0) return { opacity: 0 };
    const v = t.value;
    const inn = seg(v, INTRO.needIn, INTRO.needIn + 180);
    const out = seg(v, INTRO.needUp, INTRO.needUp + 160);
    return { opacity: inn - out, transform: [{ translateY: WORD_ROLL * (1 - inn) - WORD_ROLL * out }] };
  });

  const help = useAnimatedStyle(() => {
    if (mode.value !== 0) return { opacity: 0 };
    const v = t.value;
    const inn = seg(v, INTRO.helpIn, INTRO.helpIn + 180);
    const out = seg(v, INTRO.helpUp, INTRO.helpUp + 160);
    return { opacity: inn - out, transform: [{ translateY: WORD_ROLL * (1 - inn) - WORD_ROLL * out }] };
  });

  const idle = useAnimatedStyle(() => ({ opacity: waveIndex(mode.value, t.value, u.value) < 0 ? 1 : 0 }));

  return (
    <Tap accessibilityRole="button" accessibilityLabel="AI Chat Bot, need help?" onPress={() => router.push('/conversations')} onLongPress={() => router.push('/aysel')} delayLongPress={350}>
      <Animated.View style={[styles.pill, pill]}>
        <Animated.View style={[styles.layer, robot]}>
          <Animated.View style={[styles.image, idle]}>
            <Image source={img.avatarRobotIdleHd} style={styles.image} contentFit="cover" />
          </Animated.View>
          {waveFrames.map((src, i) => (
            <WaveFrame key={i} index={i} source={src} mode={mode} t={t} u={u} />
          ))}
        </Animated.View>
        <Animated.View style={[styles.layer, mark]}>
          <Image source={img.avatarMark} style={styles.image} contentFit="cover" />
        </Animated.View>
        <Animated.View style={[styles.layer, need]}>
          <AppText style={styles.word}>Need</AppText>
        </Animated.View>
        <Animated.View style={[styles.layer, help]}>
          <AppText style={styles.word}>help?</AppText>
        </Animated.View>
        <View pointerEvents="none" style={styles.ring} />
      </Animated.View>
    </Tap>
  );
}

function WaveFrame({ index, source, mode, t, u }: { index: number; source: number; mode: SharedValue<number>; t: SharedValue<number>; u: SharedValue<number> }) {
  const style = useAnimatedStyle(() => ({ opacity: waveIndex(mode.value, t.value, u.value) === index ? 1 : 0 }));
  return (
    <Animated.View style={[styles.image, styles.stacked, style]}>
      <Image source={source} style={styles.image} contentFit="cover" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pill: {
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: colors.accent,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  layer: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, alignItems: 'center', justifyContent: 'center' },
  image: { width: SIZE, height: SIZE, borderRadius: SIZE / 2 },
  stacked: { position: 'absolute' },
  word: { fontFamily: font.semibold, fontSize: 14, lineHeight: 18, color: colors.text, textAlign: 'center', textAlignVertical: 'center', includeFontPadding: false },
  ring: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, borderRadius: SIZE / 2, borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)' },
});
