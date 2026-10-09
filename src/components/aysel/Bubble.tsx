import { useEffect } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { FadeInRight, runOnJS, useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BotOrb } from '@/components/aysel/BotOrb';
import { AppText } from '@/components/ui/AppText';
import { getLayaUi, setLayaUi, useLayaUi } from '@/laya/store';
import { colors, font } from '@/theme/tokens';
import Svg, { Path } from 'react-native-svg';

import { useAysel } from '@/state/aysel';

export const BUBBLE_SIZE = 60;
export const BUBBLE_EDGE = 2;
/** Resting top of the bubble; the screen's shrink animation lands exactly here. */
export const bubbleRestY = (height: number) => height * 0.42;
const SIZE = BUBBLE_SIZE;
const HIT = SIZE + 20;
const EDGE = BUBBLE_EDGE;

/**
 * The shrunken assistant: a draggable orb docked to the right edge while it talks or works.
 * It pulses with the microphone or the voice, and a tap stops everything.
 */
export function AyselBubble({ host = 'root' }: { host?: 'root' | 'sheet' }) {
  const { voice, phase, level, summon, undock, screenVisible } = useAysel();
  const { caption, cursor, busy, host: activeHost } = useLayaUi();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const shown = voice === 'bubble' && !screenVisible && activeHost === host;
  const scale = useSharedValue(0);
  const y = useSharedValue(getLayaUi().bubbleY ?? bubbleRestY(height));
  const dragY = useSharedValue(0);
  // Where the bot rests when nothing is in the way; dragging moves the rest spot.
  const home = useSharedValue(bubbleRestY(height));
  const hop = useSharedValue(1);

  useEffect(() => {
    // The screen's bot already glided here, so the bubble is simply there; only leaving fades.
    scale.value = shown ? 1 : withTiming(0, { duration: 180 });
  }, [shown, scale]);


  const minY = insets.top + 12;
  const maxY = height - insets.bottom - SIZE - 12;
  const pan = Gesture.Pan()
    .onUpdate((e) => {
      dragY.value = e.translationY;
    })
    .onEnd(() => {
      const next = Math.min(maxY, Math.max(minY, y.value + dragY.value));
      home.value = next;
      y.value = withSpring(next, { damping: 18, stiffness: 180 });
      dragY.value = 0;
      runOnJS(setLayaUi)({ bubbleY: next });
    });
  const press = useSharedValue(1);
  // The mascot squashes under the finger and springs back as it leaves.
  const tap = Gesture.Tap()
    .onBegin(() => {
      press.value = withTiming(0.86, { duration: 90 });
    })
    .onFinalize(() => {
      press.value = withSpring(1, { damping: 10, stiffness: 240 });
    })
    .onEnd(() => {
      runOnJS(summon)();
    });
  const hold = Gesture.LongPress()
    .minDuration(600)
    .onStart(() => {
      runOnJS(undock)();
    });
  const gesture = Gesture.Race(tap, hold, pan);

  // Laya is about to press something: if the bot or its balloon sits over that spot, the bot slides along the
  // wall to whichever side has more room, with a small hop, and glides home once the job is done.
  useEffect(() => {
    if (!shown) return;
    const glide = (to: number) => {
      setLayaUi({ bubbleY: to });
      y.value = withSpring(to, { damping: 17, stiffness: 150, mass: 0.9 });
      hop.value = withSequence(withTiming(0.92, { duration: 110 }), withSpring(1, { damping: 9, stiffness: 220 }));
    };
    if (cursor) {
      const top = y.value;
      const nearX = cursor.x > width - SIZE - 300;
      const nearY = cursor.y > top - 48 && cursor.y < top + HIT + 48;
      if (nearX && nearY) {
        const above = cursor.y - 150 - HIT / 2;
        const below = cursor.y + 150 - HIT / 2;
        const roomAbove = above - minY;
        const roomBelow = maxY - below;
        glide(Math.min(maxY, Math.max(minY, roomAbove >= 0 || roomAbove > roomBelow ? above : below)));
      }
      return;
    }
    if (!busy && Math.abs(y.value - home.value) > 1) {
      const timer = setTimeout(() => glide(home.value), 600);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [shown, cursor, busy, width, minY, maxY, y, home, hop]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value + dragY.value }, { scale: scale.value * press.value * hop.value * (1 + level.value * 0.06) }],
    opacity: scale.value,
  }));

  if (!shown) return null;
  return (
    <GestureDetector gesture={gesture}>
      <Animated.View accessibilityRole="button" accessibilityLabel="AIsel at the edge: tap to bring it back, hold to remove" style={[styles.bubble, { left: width - HIT + (HIT - SIZE) / 2 - EDGE }, style]}>
        <BotOrb size={SIZE} level={level} mood={phase === 'speaking' ? 'speaking' : phase === 'listening' ? 'listening' : 'idle'} waveKey={shown ? 1 : 0} pop={false} />
        {caption ? (
          <View pointerEvents="none" style={[styles.balloonSlot, { right: HIT - (HIT - SIZE) / 2 + 10, width: width - SIZE - 44 }]}>
            {/* One piece: box and tail enter and leave together; a new sentence is a fresh balloon. */}
            <Animated.View key={caption} entering={FadeInRight.duration(200)} style={styles.balloonRow}>
              <View style={styles.balloon}>
                <AppText style={styles.balloonText}>{caption}</AppText>
              </View>
              {/* The tail sits outside the resizing balloon so it never moves or shows through the text. */}
              <Svg width={10} height={16} viewBox="0 0 10 16" style={styles.tail}>
                <Path d="M0 1 L10 8 L0 15 Z" fill={colors.accent} />
              </Svg>
            </Animated.View>
          </View>
        ) : null}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  balloonSlot: { position: 'absolute', top: 0, bottom: 0, alignItems: 'flex-end', justifyContent: 'center' },
  balloonRow: { flexDirection: 'row', alignItems: 'center' },
  balloon: {
    maxWidth: 250,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: colors.accent,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  balloonText: { fontFamily: font.medium, fontSize: 15, lineHeight: 20, color: colors.text },
  tail: { marginLeft: -1 },
  bubble: {
    position: 'absolute',
    top: 0,
    width: HIT,
    height: HIT,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
});
