import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type TextStyle } from 'react-native';
import Animated, { Extrapolation, interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CaretLeft } from '@/components/icons';
import { AppText } from '@/components/ui/AppText';
import { Tap } from '@/components/ui/Tap';
import { colors, headerGradient, layout } from '@/theme/tokens';

type Props = {
  title: string;
  subtitle?: string;
  /** Pills or rows under the title while the header is expanded. */
  headerExtra?: ReactNode;
  /** Overrides for the large title (size, offset) where a recorded page departs from the default. */
  titleStyle?: StyleProp<TextStyle>;
  /** Page and footer colour; the recorded IsteSen page sits on its violet panel colour, not on black. */
  backgroundColor?: string;
  right?: ReactNode;
  children: ReactNode;
  /** Pinned under the scroll area (plan chooser + primary button). */
  footer?: ReactNode;
  /** Close with an X instead of a back chevron (modal presentation). */
  closeIcon?: ReactNode;
};

const BAR = 56;

/**
 * Detail screen whose large violet header collapses into a compact centered title as the
 * list scrolls, the way the real app's tariff and credit pages behave.
 */
export function CollapsingScreen({ title, subtitle, headerExtra, right, children, footer, closeIcon, titleStyle, backgroundColor = colors.bg }: Props) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const top = Math.max(insets.top, 14);
  const scrollY = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  const barBg = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [20, 70], [0, 1], Extrapolation.CLAMP),
  }));
  const compactTitle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [45, 90], [0, 1], Extrapolation.CLAMP),
    transform: [{ translateY: interpolate(scrollY.value, [45, 90], [10, 0], Extrapolation.CLAMP) }],
  }));
  const bigTitle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 60], [1, 0], Extrapolation.CLAMP),
    transform: [{ translateY: interpolate(scrollY.value, [0, 90], [0, -12], Extrapolation.CLAMP) }],
  }));

  return (
    <View style={{ flex: 1, backgroundColor }}>
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: footer ? 24 : insets.bottom + 32 }}>
        <LinearGradient
          colors={headerGradient}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={{ paddingTop: top + BAR, paddingHorizontal: layout.gutter, paddingBottom: 22 }}>
          <Animated.View style={bigTitle}>
            <AppText variant="display" style={[{ fontSize: 28, lineHeight: 34 }, titleStyle]}>
              {title}
            </AppText>
            {subtitle ? (
              <AppText variant="body" tone="onHeaderSecondary" style={{ marginTop: 6, fontSize: 15 }}>
                {subtitle}
              </AppText>
            ) : null}
          </Animated.View>
          {headerExtra}
        </LinearGradient>
        <View style={{ paddingHorizontal: layout.gutter, paddingTop: 20 }}>{children}</View>
      </Animated.ScrollView>

      {/* Compact bar overlay */}
      <View pointerEvents="box-none" style={[styles.bar, { height: top + BAR, paddingTop: top }]}>
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, barBg]}>
          <LinearGradient colors={[colors.headerTop, colors.headerMid]} style={StyleSheet.absoluteFill} />
          <View style={styles.barLine} />
        </Animated.View>
        <View style={styles.barRow}>
          <Tap
            hitSlop={12}
            haptic={false}
            accessibilityRole="button"
            accessibilityLabel={closeIcon ? 'Close' : 'Back'}
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
            style={styles.side}>
            {closeIcon ?? <CaretLeft size={26} color={colors.text} weight="regular" />}
          </Tap>
          <Animated.View pointerEvents="none" style={[styles.center, compactTitle]}>
            <AppText variant="bodyMedium" numberOfLines={1} style={{ fontSize: 17 }}>
              {title}
            </AppText>
          </Animated.View>
          <View style={[styles.side, { alignItems: 'flex-end' }]}>{right}</View>
        </View>
      </View>

      {footer ? (
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16), backgroundColor }]}>{footer}</View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { position: 'absolute', top: 0, left: 0, right: 0 },
  barLine: { position: 'absolute', left: 0, right: 0, bottom: 0, height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(255,255,255,0.14)' },
  barRow: { flexDirection: 'row', alignItems: 'center', height: BAR, paddingHorizontal: layout.gutter - 4 },
  side: { width: 44, height: BAR, justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center' },
  footer: { paddingHorizontal: layout.gutter, paddingTop: 12 },
});
