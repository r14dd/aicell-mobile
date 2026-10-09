import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { CollapsingScreen } from '@/components/CollapsingScreen';
import { HelpCard } from '@/components/HelpCard';
import { ArrowCounterClockwise, Broadcast, CalendarBlank } from '@/components/icons';
import { PackAppIcon } from '@/components/PackAppIcon';
import { PlanChooser } from '@/components/PlanChooser';
import { useToast } from '@/components/Toast';
import { GradientPill } from '@/components/ui/GradientPill';
import { AppText, tabular } from '@/components/ui/AppText';
import { activateSocialPack, getInternetPacks, getSocialPack, rowsForPlan } from '@/api/packs';
import { errorMessage } from '@/api/client';
import { useQuery } from '@/api/query';
import { findSocialDetail, internetPacksSeed } from '@/data/internetPacks';
import { money } from '@/data/mock';
import { tariffSurface } from '@/data/myTariff';
import { confirmPurchase } from '@/laya/identity';
import { setLayaUi, signal } from '@/laya/store';
import { useAccount } from '@/state/account';
import { colors, layout } from '@/theme/tokens';

export default function PackDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const { applyMoney } = useAccount();
  const seed = findSocialDetail(id);
  const { data: pack = seed } = useQuery(id ? `packs/social/${id}/` : null, () => getSocialPack(id), seed);
  // The detail answer has no subtitle; the list card carries it (same query the list screen already loaded).
  const { data: list = internetPacksSeed } = useQuery('packs/internet/', getInternetPacks, internetPacksSeed);
  const [planId, setPlanId] = useState<string>();
  const [busy, setBusy] = useState(false);
  const plan = pack.plans.find((p) => p.id === planId) ?? pack.plans.find((p) => p.id === pack.defaultPlan) ?? pack.plans[0];

  // The server also sends a "Renews: Manually" row for manual packs; the app only shows that row for auto-renewing ones.
  const rows = rowsForPlan(pack.rows, plan).filter((_, i) => i < 2 || pack.badge);

  const activate = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (!(await confirmPurchase(`Pay ${money(plan.price)} ₼`))) {
        signal('authFailed');
        return;
      }
      const res = await activateSocialPack(pack.id, plan.id);
      applyMoney(res);
      toast(`${pack.title} ${plan.title} ${pack.badge ? 'subscribed' : 'activated'} for ${money(plan.price)} ₼`);
      signal('paid');
      router.back();
    } catch (e) {
      // 402 and 409 already_active both arrive with a ready-made `detail`.
      toast(errorMessage(e));
      setLayaUi({ error: errorMessage(e) });
      signal('failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <CollapsingScreen
      title={pack.title}
      subtitle={list.social.find((s) => s.id === pack.id)?.subtitle}
      backgroundColor={tariffSurface}
      titleStyle={{ marginTop: 16, marginBottom: 6 }}
      headerExtra={
        <View style={styles.headerExtra}>
          {pack.badge ? (
            <GradientPill label={pack.badge} style={{ marginTop: 16 }} />
          ) : null}
        </View>
      }
      footer={
        <PlanChooser
          plans={pack.plans.map((p) => ({ id: p.id, title: p.title, price: p.price, priceLabel: `${money(p.price)} ₼` }))}
          selectedId={plan.id}
          onSelect={setPlanId}
          ctaLabel={`${pack.cta} for ${money(plan.price)} ₼`}
          onPress={() => void activate()}
          targetPrefix="social"
        />
      }>
      <View style={styles.panel}>
        <Animated.View key={plan.id} entering={FadeIn.duration(200)}>
          {rows.map((r, i) => (
            <Row
              key={r.label}
              icon={rowIcon(i)}
              label={r.label}
              value={r.value}
              badge={i === 0 ? <PackAppIcon app={pack.app} size={22} /> : undefined}
            />
          ))}
        </Animated.View>

        <View style={styles.note}>
          <AppText variant="small" tone="accent" style={{ textAlign: 'center' }}>
            {pack.note}
          </AppText>
        </View>
        <View style={{ marginTop: 20 }}>
          <HelpCard color={colors.cardRaised} />
        </View>
        <View style={{ height: 24 }} />
      </View>
    </CollapsingScreen>
  );
}

// Traffic, validity, then the renewal row of auto-renewing packs.
function rowIcon(i: number) {
  if (i === 0) return <Broadcast size={20} color={colors.blue} weight="regular" />;
  if (i === 1) return <CalendarBlank size={20} color={colors.accent} weight="regular" />;
  return <ArrowCounterClockwise size={20} color={colors.accent} weight="regular" />;
}

function Row({ icon, label, value, badge }: { icon: ReactNode; label: string; value: string; badge?: ReactNode }) {
  return (
    <View style={styles.row}>
      {icon}
      <View style={styles.label}>
        <AppText variant="body" style={{ fontSize: 15 }}>
          {label}
        </AppText>
        {badge}
      </View>
      <AppText variant="bodySemibold" style={[{ fontSize: 15 }, tabular]}>
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  // 36pt below the subtitle (or pill) keeps the gradient behind the panel's rounded corners.
  headerExtra: { marginBottom: 36 },
  // Full-bleed body panel that overlaps the header gradient so its rounded top shows the gradient.
  panel: {
    marginHorizontal: -layout.gutter,
    marginTop: -42,
    marginBottom: -24,
    paddingHorizontal: layout.gutter,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: tariffSurface,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  row: { flexDirection: 'row', alignItems: 'center', height: 52, gap: 18 },
  label: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  note: { marginTop: 18, backgroundColor: colors.noteBg, borderRadius: 14, padding: 14 },
});
