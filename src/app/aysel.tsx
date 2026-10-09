import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BotOrb } from '@/components/aysel/BotOrb';
import { BUBBLE_EDGE, BUBBLE_SIZE, bubbleRestY } from '@/components/aysel/Bubble';
import { SpeechPill } from '@/components/aysel/SpeechPill';
import { X } from '@/components/icons';
import { AppText } from '@/components/ui/AppText';
import { Tap } from '@/components/ui/Tap';
import { useAysel, type AyselPhase } from '@/state/aysel';
import { colors, headerGradient, layout } from '@/theme/tokens';
import { stopSpeaking } from '@/voice/speak';

const ORB = 112;
const SHRINK_MS = 460;

function pillText(phase: AyselPhase, heard: string, reply: string | null) {
  if (phase === 'listening') return heard || reply || 'Sizi dinləyirəm…';
  if (phase === 'thinking') return heard || 'Bir anlıq…';
  if (phase === 'denied') return 'Mikrofon icazəsi bağlıdır';
  if (phase === 'off') return 'Səs üçün development build lazımdır';
  return reply ?? 'Bota toxunun və danışın';
}

/**
 * AIsel in person: the mascot fills the screen and listens as soon as it opens. A tap on the bot
 * stops or restarts listening; when the command is in, the bot shrinks into the right-edge bubble.
 */
export default function AyselScreen() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { phase, heard, reply, level, voice, arriveFromDock, attach, detach, listen, ask, say, cancel, stop, requestAccess } = useAysel();
  // Deep links: `azercell:///aysel?ask=...` types a command, `?say=...` behaves like a spoken one (demo links, device tests).
  const { ask: askParam, say: sayParam } = useLocalSearchParams<{ ask?: string; say?: string }>();
  const orbBox = useRef<View>(null);
  const [orbCenter, setOrbCenter] = useState<{ x: number; y: number } | null>(null);
  // Opened from the docked bot: start at the wall and glide to the centre once the orb is measured.
  const [arrival] = useState(() => arriveFromDock);
  const shrink = useSharedValue(arriveFromDock ? 1 : 0);
  const [waveKey, setWaveKey] = useState(1);

  useEffect(() => {
    attach();
    if (askParam) ask(String(askParam));
    if (sayParam) say(String(sayParam));
    return detach;
  }, [attach, detach, ask, say, askParam, sayParam]);

  // One place moves the bot: in from the wall when summoned, out to the wall when a job starts (then the screen leaves).
  useEffect(() => {
    if (voice === 'bubble') {
      shrink.value = withTiming(1, { duration: SHRINK_MS, easing: Easing.inOut(Easing.cubic) });
      const timer = setTimeout(() => {
        if (router.canGoBack()) router.back();
        else router.replace('/');
      }, SHRINK_MS + 40);
      return () => clearTimeout(timer);
    }
    if (arrival && orbCenter) shrink.value = withTiming(0, { duration: SHRINK_MS, easing: Easing.out(Easing.cubic) });
    return undefined;
  }, [voice, arrival, orbCenter, shrink]);

  const target = { x: width - BUBBLE_EDGE - BUBBLE_SIZE / 2, y: bubbleRestY(height) + BUBBLE_SIZE / 2 };
  const orbStyle = useAnimatedStyle(() => {
    const p = shrink.value;
    const dx = orbCenter ? (target.x - orbCenter.x) * p : 0;
    const dy = orbCenter ? (target.y - orbCenter.y) * p : 0;
    return { transform: [{ translateX: dx }, { translateY: dy }, { scale: 1 - p * (1 - BUBBLE_SIZE / ORB) }] };
  });
  const fadeStyle = useAnimatedStyle(() => ({ opacity: 1 - shrink.value }));

  const onBot = () => {
    setWaveKey((k) => k + 1);
    if (phase === 'listening' || phase === 'thinking') cancel();
    else if (phase === 'speaking') stop();
    else if (phase === 'denied') requestAccess();
    else listen();
  };

  const close = () => {
    stopSpeaking();
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  const mood = phase === 'listening' ? 'listening' : phase === 'speaking' ? 'speaking' : 'idle';

  return (
    <LinearGradient colors={headerGradient} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={styles.root}>
      <View style={[styles.column, { paddingTop: insets.top + 6, paddingBottom: insets.bottom + 28 }]}>
        <Animated.View style={[styles.topBar, fadeStyle]}>
          <Tap hitSlop={12} haptic={false} accessibilityRole="button" accessibilityLabel="Close" onPress={close} style={styles.topButton}>
            <X size={26} color={colors.text} />
          </Tap>
        </Animated.View>

        <View style={styles.center}>
          <Animated.View style={orbStyle}>
            <View ref={orbBox} collapsable={false} onLayout={() => orbBox.current?.measureInWindow((x, y, w, h) => setOrbCenter({ x: x + w / 2, y: y + h / 2 }))}>
              <Tap haptic pressScale={0.9} accessibilityRole="button" accessibilityLabel={phase === 'listening' ? 'Listening, tap to stop' : 'Tap to talk'} onPress={onBot}>
                <BotOrb size={ORB} level={level} mood={mood} waveKey={waveKey} />
              </Tap>
            </View>
          </Animated.View>
          <Animated.View style={[styles.pillWrap, fadeStyle]}>
            <SpeechPill text={pillText(phase, heard, reply)} />
          </Animated.View>
        </View>

        <Animated.View style={[styles.hint, fadeStyle]}>
          <AppText variant="caption" tone="onHeaderSecondary" style={{ textAlign: 'center' }}>
            {phase === 'listening' ? 'Bota toxunanda dinləmə dayanır' : voice === 'bubble' ? 'Bot kənara gedir' : reply ? 'Cavab vermək üçün bota toxunun' : '"Hey AIsel" deyin və ya bota toxunun'}
          </AppText>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center' },
  column: { flex: 1, width: '100%', maxWidth: layout.maxWidth, paddingHorizontal: layout.gutter },
  topBar: { height: 44, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' },
  topButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 30 },
  pillWrap: { marginTop: 10, alignItems: 'center' },
  hint: { alignItems: 'center' },
});
