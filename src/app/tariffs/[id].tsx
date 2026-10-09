import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';

import { errorMessage } from '@/api/client';
import { invalidate, useQuery } from '@/api/query';
import { getFamily, subscribeToPlan, tariffPath, toTariffPage } from '@/api/tariffs';
import { CollapsingScreen } from '@/components/CollapsingScreen';
import { HelpCard } from '@/components/HelpCard';
import {
  ArrowCounterClockwise,
  Broadcast,
  CaretDown,
  CaretRight,
  CaretUp,
  CellSignalFull,
  ChatText,
  FacebookLogo,
  Globe,
  Info,
  InstagramLogo,
  Phone,
  TelegramLogo,
  TiktokLogo,
  WhatsappLogo,
} from '@/components/icons';
import { PlanChooser } from '@/components/PlanChooser';
import { useToast } from '@/components/Toast';
import { AppText, tabular } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { Divider } from '@/components/ui/Divider';
import { Tap } from '@/components/ui/Tap';
import { confirmPurchase } from '@/laya/identity';
import { setLayaUi, signal } from '@/laya/store';
import { useAccount } from '@/state/account';
import { money, type Social } from '@/data/mock';
import { tariffPageSeed, type FeatureKind, type TariffFeature } from '@/data/tariffs';
import { colors, font, radius } from '@/theme/tokens';

const featureIcons: Record<FeatureKind, ReactNode> = {
  internet: <Broadcast size={20} color={colors.accentIcon} weight="regular" />,
  calls: <Phone size={20} color={colors.accentIcon} weight="regular" />,
  sms: <ChatText size={20} color={colors.accentIcon} weight="regular" />,
  social: <Globe size={20} color={colors.accentIcon} weight="regular" />,
  app: <Globe size={20} color={colors.accentIcon} weight="regular" />,
  roaming: <CellSignalFull size={20} color={colors.accentIcon} weight="regular" />,
  validity: <ArrowCounterClockwise size={20} color={colors.accentIcon} weight="regular" />,
};

const socials: Record<Social, { color: string; icon: ReactNode }> = {
  whatsapp: { color: '#25D366', icon: <WhatsappLogo size={12} color={colors.text} weight="fill" /> },
  telegram: { color: '#2AABEE', icon: <TelegramLogo size={12} color={colors.text} weight="fill" /> },
  instagram: { color: '#E1306C', icon: <InstagramLogo size={12} color={colors.text} weight="fill" /> },
  facebook: { color: '#1877F2', icon: <FacebookLogo size={12} color={colors.text} weight="fill" /> },
  tiktok: { color: '#111111', icon: <TiktokLogo size={12} color={colors.text} weight="fill" /> },
};

export default function TariffScreen() {
  const { id, plan } = useLocalSearchParams<{ id: string; plan?: string }>();
  const router = useRouter();
  const toast = useToast();
  const seed = tariffPageSeed(id, plan);
  const { data: page = seed } = useQuery(tariffPath.family(id, plan), () => getFamily(id, plan).then(toTariffPage), seed);
  const { family, totalPrice, note, cta } = page;
  // Until a chip is tapped the server's pick (the `plan` param, else its default) stays selected.
  const [planId, setPlanId] = useState<string>();
  const [expanded, setExpanded] = useState(false);
  const selected = family.plans.find((p) => p.id === (planId ?? family.defaultPlanId)) ?? family.plans[0];
  const { applyMoney } = useAccount();
  const [busy, setBusy] = useState(false);

  const subscribe = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (!(await confirmPurchase(`Pay ${money(selected.price)} ₼`))) {
        signal('authFailed');
        return;
      }
      const res = await subscribeToPlan(selected.id);
      applyMoney(res);
      invalidate('tariffs/');
      invalidate('insights/');
      invalidate('usage/');
      toast(`${res.tariff.title} activated for ${res.tariff.price} ₼`);
      signal('paid');
    } catch (e) {
      // 402 insufficient_balance and 409 arrive with a ready-made `detail`.
      toast(errorMessage(e));
      setLayaUi({ error: errorMessage(e) });
      signal('failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <CollapsingScreen
      title={family.name}
      subtitle={family.subtitle}
      headerExtra={
        <>
          <View style={styles.badges}>
            {family.badges.map((b) => (
              <View key={b} style={{ backgroundColor: b === 'PREMIUM' ? '#F2E7D8' : '#4D63E6', borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 6 }}>
                <AppText style={{ fontFamily: font.bold, fontSize: 11, lineHeight: 14, letterSpacing: 0.4, color: b === 'PREMIUM' ? '#6B4B2A' : colors.text }}>{b}</AppText>
              </View>
            ))}
          </View>
          {family.premium ? (
            <Tap
              accessibilityRole="button"
              accessibilityLabel="See all premium benefits"
              onPress={() => router.push('/premium')}
              style={styles.benefits}>
              <AppText variant="body" style={{ flex: 1 }}>
                See all premium benefits
              </AppText>
              <CaretRight size={18} color={colors.text} />
            </Tap>
          ) : null}
        </>
      }
      footer={
        <PlanChooser
          plans={family.plans.map((p) => ({ id: p.id, title: p.title, price: p.price, hot: p.hot }))}
          selectedId={selected.id}
          onSelect={setPlanId}
          ctaLabel={selected.id === family.defaultPlanId && cta ? cta : `Subscribe for ${money(selected.price)} ₼`}
          onPress={() => void subscribe()}
          targetPrefix="tariff"
        />
      }>
      <Animated.View key={selected.id} entering={FadeIn.duration(220)}>
        <Card padded={false} style={{ paddingHorizontal: 20 }}>
          {selected.features.map((f, i) => (
            <View key={f.kind + f.label}>
              {i > 0 ? <Divider /> : null}
              <FeatureRow feature={f} onInfo={() => toast(`${f.label} details are not part of this prototype yet`)} />
            </View>
          ))}
        </Card>

        <Animated.View layout={LinearTransition} style={styles.total}>
          <Tap
            haptic={false}
            pressScale={0.99}
            accessibilityRole="button"
            accessibilityLabel="Total price"
            accessibilityState={{ expanded }}
            onPress={() => setExpanded((e) => !e)}
            style={styles.totalHead}>
            <AppText variant="bodySemibold" style={{ flex: 1 }}>
              Total price
            </AppText>
            {expanded ? (
              <CaretUp size={18} color={colors.textSecondary} />
            ) : (
              <CaretDown size={18} color={colors.textSecondary} />
            )}
          </Tap>
          {expanded ? (
            <Animated.View entering={FadeIn.duration(180)} exiting={FadeOut.duration(120)} style={{ paddingBottom: 12 }}>
              {totalPrice.map((g, gi) => (
                <View key={g.heading}>
                  <AppText variant="caption" tone={g.tone} style={gi > 0 ? { marginTop: 10 } : undefined}>
                    {g.heading}
                  </AppText>
                  {g.rows.map((r) => (
                    <View key={r.label} style={styles.rate}>
                      <AppText variant="caption">{r.label}</AppText>
                      <AppText variant="captionMedium" style={tabular}>
                        {money(r.value)} ₼
                      </AppText>
                    </View>
                  ))}
                </View>
              ))}
            </Animated.View>
          ) : null}
        </Animated.View>

        <Animated.View layout={LinearTransition}>
          <View style={styles.note}>
            <AppText variant="small" tone="accent" style={{ textAlign: 'center' }}>
              {note}
            </AppText>
          </View>
          <View style={{ marginTop: 16 }}>
            <HelpCard />
          </View>
          <View style={{ height: 24 }} />
        </Animated.View>
      </Animated.View>
    </CollapsingScreen>
  );
}

function FeatureRow({ feature, onInfo }: { feature: TariffFeature; onInfo: () => void }) {
  const hint = feature.kind === 'calls' || feature.kind === 'sms';
  return (
    <View style={styles.row}>
      {featureIcons[feature.kind]}
      <AppText variant="body" style={{ fontSize: 15 }}>
        {feature.label}
      </AppText>
      {hint ? (
        <Tap hitSlop={10} haptic={false} accessibilityRole="button" accessibilityLabel={`${feature.label} details`} onPress={onInfo}>
          <Info size={14} color={colors.info} />
        </Tap>
      ) : null}
      {feature.socials ? (
        <View style={styles.cluster}>
          {feature.socials.map((s, i) => (
            <View key={s} style={[styles.social, { backgroundColor: socials[s].color }, i > 0 && { marginLeft: -6 }]}>
              {socials[s].icon}
            </View>
          ))}
        </View>
      ) : null}
      <View style={{ flex: 1 }} />
      <AppText variant="bodyMedium" style={[{ fontSize: 15 }, tabular]}>
        {feature.value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badges: { flexDirection: 'row', gap: 8, marginTop: 12 },
  benefits: {
    marginTop: 14,
    backgroundColor: colors.glass,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 52, gap: 12 },
  cluster: { flexDirection: 'row', alignItems: 'center' },
  social: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  total: {
    marginTop: 12,
    paddingHorizontal: 20,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  totalHead: { height: 54, flexDirection: 'row', alignItems: 'center' },
  rate: { height: 36, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  note: { marginTop: 12, backgroundColor: colors.noteBg, borderRadius: 14, padding: 14 },
});
