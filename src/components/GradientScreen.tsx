import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { Extrapolation, interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, headerGradient, layout, radius } from '@/theme/tokens';

type Props = {
  /** Content laid over the violet header gradient (scrolls away). */
  header: ReactNode;
  /** Bar that stays pinned at the top while the page scrolls (the TopBar on tab screens). */
  pinned?: ReactNode;
  /** Content of the black sheet that rises over the header. */
  children: ReactNode;
  withTabBar?: boolean;
  sheetStyle?: StyleProp<ViewStyle>;
};

export const SHEET_RADIUS = radius.xl;
const PINNED_HEIGHT = 52;

/** Tab-screen frame: violet sky header, black sheet with rounded top rising over it, optional pinned top bar. */
export function GradientScreen({ header, pinned, children, withTabBar = true, sheetStyle }: Props) {
  const insets = useSafeAreaInsets();
  const top = Math.max(insets.top, 14);
  const bottomSpace = (withTabBar ? layout.tabBarHeight + layout.fabLift : 0) + insets.bottom + 24;
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });
  const barBg = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [24, 96], [0, 1], Extrapolation.CLAMP),
  }));

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={{ flex: 1, backgroundColor: colors.bg }}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}>
        <View style={{ position: 'absolute', top: -900, left: 0, right: 0, height: 900, backgroundColor: colors.headerTop }} />
        <LinearGradient
          colors={headerGradient}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={{ paddingTop: pinned ? top + PINNED_HEIGHT : top + 6, paddingBottom: SHEET_RADIUS + 24 }}>
          {header}
        </LinearGradient>
        <View
          style={[
            {
              backgroundColor: colors.bg,
              borderTopLeftRadius: SHEET_RADIUS,
              borderTopRightRadius: SHEET_RADIUS,
              marginTop: -SHEET_RADIUS,
              paddingTop: 26,
              paddingHorizontal: layout.gutter,
              paddingBottom: bottomSpace,
              minHeight: 420,
            },
            sheetStyle,
          ]}>
          {children}
        </View>
      </Animated.ScrollView>

      {pinned ? (
        <View pointerEvents="box-none" style={[styles.pinned, { paddingTop: top }]}>
          <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, barBg]}>
            <LinearGradient colors={[colors.headerTop, colors.headerMid]} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={StyleSheet.absoluteFill} />
          </Animated.View>
          {pinned}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  pinned: { position: 'absolute', top: 0, left: 0, right: 0 },
});
