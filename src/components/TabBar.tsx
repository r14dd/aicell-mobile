import type { BottomTabBarProps } from 'expo-router/build/react-navigation/bottom-tabs/types';
import { Platform, StyleSheet, View } from 'react-native';

import { House, List, Plus, SealPercent, SquaresFour } from '@/components/icons';
import { AppText } from '@/components/ui/AppText';
import { Tap } from '@/components/ui/Tap';
import { colors, font, layout } from '@/theme/tokens';

const ICONS = { index: House, products: SquaresFour, benefits: SealPercent, more: List } as const;
const FAB = 42;
const RING = 52;

/** Azercell bottom bar: four destinations and the raised purple "+" for Payments. */
export function TabBar({ state, descriptors, navigation, insets }: BottomTabBarProps) {
  const bottom = Math.max(insets.bottom, Platform.OS === 'web' ? 10 : 0);
  const barHeight = layout.tabBarHeight + bottom;

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { height: barHeight + layout.fabLift }]}>
      <View style={[styles.bar, { height: barHeight }]} />
      <View style={[styles.row, { bottom, height: layout.tabBarHeight }]}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const label = descriptors[route.key]?.options.title ?? route.name;
          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
          };

          if (route.name === 'payments') {
            return (
              <Tap
                key={route.key}
                onPress={onPress}
                pressScale={0.95}
                accessibilityRole="button"
                accessibilityLabel={label}
                accessibilityState={focused ? { selected: true } : {}}
                style={styles.fabItem}>
                <View style={styles.ring}>
                  <View style={[styles.fab, focused && { backgroundColor: colors.accentPressed }]}>
                    <Plus size={24} color={colors.text} weight="bold" />
                  </View>
                </View>
                <AppText style={[styles.label, { color: colors.accentLink, fontFamily: focused ? font.semibold : font.regular }]}>{label}</AppText>
              </Tap>
            );
          }

          const Icon = ICONS[route.name as keyof typeof ICONS] ?? House;
          const color = focused ? colors.text : colors.tabInactive;
          return (
            <Tap
              key={route.key}
              onPress={onPress}
              pressScale={0.95}
              haptic={false}
              accessibilityRole="button"
              accessibilityLabel={label}
              accessibilityState={focused ? { selected: true } : {}}
              style={styles.item}>
              <Icon size={24} color={color} weight={focused ? 'fill' : 'light'} />
              <AppText style={[styles.label, { color, fontFamily: focused ? font.semibold : font.regular }]}>{label}</AppText>
            </Tap>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.tabBar,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.lineStrong,
  },
  row: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', alignItems: 'stretch' },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 5, paddingTop: 2 },
  fabItem: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 8 },
  ring: {
    width: RING,
    height: RING,
    borderRadius: RING / 2,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  fab: { width: FAB, height: FAB, borderRadius: FAB / 2, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 12, lineHeight: 15 },
});
