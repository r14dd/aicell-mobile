import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/AppText';
import { colors, layout, radius } from '@/theme/tokens';

const ToastContext = createContext<(message: string) => void>(() => {});
const HOLD_MS = 2400;

/** Lightweight in-app toast for prototype dead-ends and confirmations. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const progress = useSharedValue(0);
  const anim = useRef(progress);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const insets = useSafeAreaInsets();

  const show = useCallback(
    (next: string) => {
      setMessage(next);
      anim.current.value = withTiming(1, { duration: 180, easing: Easing.out(Easing.cubic) });
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        anim.current.value = withTiming(0, { duration: 220 });
        timer.current = setTimeout(() => setMessage(null), 240);
      }, HOLD_MS);
    },
    [],
  );

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * 10 }],
  }));

  return (
    <ToastContext.Provider value={show}>
      {children}
      {message ? (
        <Animated.View
          pointerEvents="none"
          accessibilityLiveRegion="polite"
          style={[styles.toast, { bottom: layout.tabBarHeight + layout.fabLift + insets.bottom + 12 }, style]}>
          <AppText variant="captionMedium" style={{ textAlign: 'center' }}>
            {message}
          </AppText>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    alignSelf: 'center',
    maxWidth: 340,
    marginHorizontal: 24,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: radius.md,
    backgroundColor: colors.cardRaised,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
});
