import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

import { useLayaUi } from '@/laya/store';
import { colors } from '@/theme/tokens';

const SIZE = 46;
type Origin = { x: number; y: number };

/** Laya's pointer: a violet disc that glides to the control it is about to use. Mount one per native window (root and modals). */
export function LayaCursor({ origin = { x: 0, y: 0 } }: { origin?: Origin }) {
  const { cursor, pressing } = useLayaUi();
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const shown = useSharedValue(0);
  const press = useSharedValue(1);
  const wasShown = useRef(false);

  useEffect(() => {
    if (cursor) {
      const nx = cursor.x - origin.x;
      const ny = cursor.y - origin.y;
      if (wasShown.current) {
        x.value = withTiming(nx, { duration: 480, easing: Easing.out(Easing.cubic) });
        y.value = withTiming(ny, { duration: 480, easing: Easing.out(Easing.cubic) });
      } else {
        x.value = nx;
        y.value = ny;
      }
      wasShown.current = true;
      shown.value = withTiming(1, { duration: 160 });
    } else {
      wasShown.current = false;
      shown.value = withTiming(0, { duration: 220 });
    }
  }, [cursor, origin.x, origin.y, x, y, shown]);

  useEffect(() => {
    if (pressing) press.value = withSequence(withTiming(0.7, { duration: 110 }), withTiming(1, { duration: 200, easing: Easing.out(Easing.quad) }));
  }, [pressing, press]);

  const style = useAnimatedStyle(() => ({
    opacity: shown.value,
    transform: [{ translateX: x.value - SIZE / 2 }, { translateY: y.value - SIZE / 2 }, { scale: press.value }],
  }));

  return (
    <Animated.View pointerEvents="none" style={[styles.cursor, style]}>
      <View style={styles.dot} />
    </Animated.View>
  );
}

/** Root-level layer: caption plus the pointer, mapped from window coordinates into this view. */
export function LayaOverlay() {
  const ref = useRef<View>(null);
  const [origin, setOrigin] = useState<Origin>({ x: 0, y: 0 });
  return (
    <View ref={ref} pointerEvents="none" style={styles.overlay} onLayout={() => ref.current?.measureInWindow((x, y) => setOrigin({ x, y }))}>
      <LayaCursor origin={origin} />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  cursor: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: 'rgba(123,65,232,0.38)',
    borderWidth: 2,
    borderColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: { width: 14, height: 14, borderRadius: 7, backgroundColor: colors.accentSoft },
});
