import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { Fire } from '@/components/icons';
import { AppText, tabular } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Tap } from '@/components/ui/Tap';
import { LayaSpot } from '@/laya/LayaSpot';
import { colors, font, radius } from '@/theme/tokens';

export type Plan = { id: string; title: string; price: number; hot?: boolean; /** Overrides the default `${price} ₼`, e.g. "1.20 ₼" where the app shows two decimals. */ priceLabel?: string };

type Props = {
  plans: Plan[];
  selectedId: string;
  onSelect: (id: string) => void;
  ctaLabel: string;
  onPress: () => void;
  label?: string;
  /** Registers `<prefix>.plan.<id>` and `<prefix>.cta` so Laya can choose a plan and press the action. */
  targetPrefix?: string;
};

/** Footer of credit and tariff pages: "CHOOSE YOUR PLAN" chips plus the primary action whose label follows the plan. */
export function PlanChooser({ plans, selectedId, onSelect, ctaLabel, onPress, label = 'CHOOSE YOUR PLAN', targetPrefix }: Props) {
  const spot = (id: string, press: () => void, style: object | undefined, node: ReactNode) =>
    targetPrefix ? (
      <LayaSpot key={id} id={`${targetPrefix}.${id}`} press={press} style={style}>
        {node}
      </LayaSpot>
    ) : (
      node
    );
  return (
    <View>
      <AppText variant="label" tone="secondary" style={styles.label}>
        {label}
      </AppText>
      <View style={styles.row}>
        {plans.map((p) => {
          const on = p.id === selectedId;
          return spot(
            `plan.${p.id}`,
            () => onSelect(p.id),
            { flex: 1 },
            <Tap
              key={p.id}
              onPress={() => onSelect(p.id)}
              pressScale={0.96}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              accessibilityLabel={`${p.title}, ${p.price} manat`}
              style={[styles.chip, on && styles.chipOn]}>
              {p.hot ? (
                <View style={styles.hot}>
                  <Fire size={10} color={colors.text} weight="fill" />
                </View>
              ) : null}
              <AppText numberOfLines={1} style={[styles.chipTitle, on && { color: colors.text }]}>
                {p.title}
              </AppText>
              <AppText style={[styles.chipPrice, tabular]}>{p.priceLabel ?? `${p.price} ₼`}</AppText>
            </Tap>,
          );
        })}
      </View>
      <Animated.View key={ctaLabel} entering={FadeIn.duration(220)} exiting={FadeOut.duration(120)} style={{ marginTop: 14 }}>
        {spot('cta', onPress, undefined, <Button label={ctaLabel} variant="gradient" size="lg" onPress={onPress} />)}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { textAlign: 'center', marginBottom: 10 },
  row: { flexDirection: 'row', gap: 10 },
  chip: {
    flex: 1,
    minHeight: 58,
    borderRadius: radius.sm,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    gap: 2,
  },
  chipOn: { borderColor: colors.accentIcon, backgroundColor: colors.cardRaised },
  chipTitle: { fontFamily: font.regular, fontSize: 13, lineHeight: 17, color: colors.textSecondary },
  chipPrice: { fontFamily: font.semibold, fontSize: 15, lineHeight: 19, color: colors.text },
  hot: {
    position: 'absolute',
    top: -7,
    right: -5,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
