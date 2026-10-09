import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter, type Href } from 'expo-router';
import { useState, useCallback, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';

import { useQuery } from '@/api/query';
import { getMyTariff, renewTariff, runTariffAction, tariffPath, toMyTariff } from '@/api/tariffs';
import { CollapsingScreen } from '@/components/CollapsingScreen';
import { HelpCard } from '@/components/HelpCard';
import {
  ArrowCounterClockwise,
  ArrowsLeftRight,
  Broadcast,
  CaretDown,
  CaretUp,
  Info,
  Phone,
  SketchLogo,
  WhatsappLogo,
} from '@/components/icons';
import { Sheet } from '@/components/Sheet';
import { useToast } from '@/components/Toast';
import { AppText, tabular } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { ListRow } from '@/components/ui/ListRow';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Tap } from '@/components/ui/Tap';
import { money } from '@/data/mock';
import { bannerWantMore, bannerWantMoreAspect, myTariffSeed, tariffSurface, type UsageKind } from '@/data/myTariff';
import { useAccount } from '@/state/account';
import { colors, ctaGradient, layout, radius } from '@/theme/tokens';

const barColor: Record<UsageKind, string> = { internet: colors.blue, messaging: colors.blue, calls: colors.accent };

export default function MyTariffScreen() {
  const router = useRouter();
  const toast = useToast();
  const { applyMoney } = useAccount();
  const { data: tariff = myTariffSeed } = useQuery(tariffPath.my, () => getMyTariff().then(toMyTariff), myTariffSeed);
  const [expanded, setExpanded] = useState(false);
  const [manage, setManage] = useState(false);
  const [renew, setRenew] = useState(false);

  const reopen = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (reopen.current) {
        reopen.current = false;
        setManage(true);
      }
    }, []),
  );

  /** Rows of the Manage sheet leave the page; the sheet comes back with it. */
  const leaveFromSheet = (href: '/my-tariff/redesign' | '/my-tariff/change') => {
    reopen.current = true;
    setManage(false);
    router.push(href);
  };

  const openRedesign = () => router.push('/my-tariff/redesign');

  return (
    <>
      <CollapsingScreen
        title={tariff.title}
        backgroundColor={tariffSurface}
        titleStyle={{ fontSize: 32, lineHeight: 38, marginTop: 20 }}
        headerExtra={
          <>
            <View style={{ marginTop: 14, gap: 14 }}>
              {tariff.lines.map((l) => (
                <View key={l.label} style={styles.headLine}>
                  <AppText variant="caption" tone="onHeaderSecondary" style={styles.headText}>
                    {l.label}
                  </AppText>
                  <AppText variant="caption" style={[styles.headText, { color: 'rgba(221,214,243,0.6)' }]}>
                    {l.value}
                  </AppText>
                </View>
              ))}
            </View>
            <View style={styles.pills}>
              {tariff.pills.map((p) => (
                <View key={p} style={styles.pill}>
                  <AppText variant="label" style={styles.pillText}>
                    {p}
                  </AppText>
                </View>
              ))}
            </View>
          </>
        }
        footer={<Button variant="gradient" size="lg" label="Manage tariff" onPress={() => setManage(true)} />}>
        <View style={styles.panel}>
          {tariff.usage.map((u) => (
            <View key={u.kind} style={styles.usage}>
              <View style={styles.usageHead}>
                {u.kind === 'calls' ? (
                  <Phone size={22} color={colors.accent} weight="regular" />
                ) : (
                  <Broadcast size={22} color={colors.blue} weight="regular" />
                )}
                <AppText variant="body">{u.label}</AppText>
                {u.kind === 'messaging' ? (
                  <View style={styles.whatsapp}>
                    <WhatsappLogo size={14} color={colors.text} weight="fill" />
                  </View>
                ) : null}
                {u.kind === 'calls' ? (
                  <Tap
                    hitSlop={10}
                    haptic={false}
                    accessibilityRole="button"
                    accessibilityLabel="Local calls details"
                    onPress={() => toast('Local calls details are not part of this prototype yet')}>
                    <Info size={16} color={colors.info} />
                  </Tap>
                ) : null}
              </View>
              <View style={{ marginTop: 10 }}>
                <ProgressBar value={u.ratio} color={barColor[u.kind]} />
              </View>
              <View style={styles.usageValues}>
                <Amount value={u.remaining} unit={u.remainingUnit} />
                <Amount value={u.total} unit={u.totalUnit} />
              </View>
            </View>
          ))}

          <AppText variant="caption" tone="secondary" style={{ marginTop: 6 }}>
            Payment details
          </AppText>
          {tariff.paymentDetails.map((d) => (
            <View key={d.label} style={styles.detail}>
              <AppText variant="body">{d.label}</AppText>
              <AppText variant="body" style={tabular}>
                {d.value}
              </AppText>
            </View>
          ))}

          <Tap
            pressScale={0.99}
            accessibilityRole="button"
            accessibilityLabel="Redesign your tariff"
            onPress={openRedesign}
            style={{ marginTop: 14 }}>
            <LinearGradient
              colors={['#8D7FFE', '#4B72E4']}
              start={{ x: 0, y: 0.2 }}
              end={{ x: 1, y: 0.8 }}
              style={styles.redesign}>
              <View style={{ flex: 1 }}>
                <AppText variant="bodySemibold" style={{ fontSize: 20, lineHeight: 26 }}>
                  Redesign your tariff
                </AppText>
                <AppText variant="small" style={{ color: 'rgba(255,255,255,0.9)', marginTop: 8, fontSize: 13, lineHeight: 17 }}>
                  Customise & Save it for the next tariff renewal
                </AppText>
              </View>
              <View style={styles.redesignDisc}>
                <AppText variant="bodySemibold" style={{ fontSize: 14, lineHeight: 20, textAlign: 'center', color: 'rgba(255,255,255,0.85)' }}>
                  Redesign right now
                </AppText>
              </View>
            </LinearGradient>
          </Tap>

          <Animated.View layout={LinearTransition} style={styles.total}>
            <Tap
              haptic={false}
              pressScale={0.99}
              accessibilityRole="button"
              accessibilityLabel="Total price"
              accessibilityState={{ expanded }}
              onPress={() => setExpanded((e) => !e)}
              style={styles.totalHead}>
              <AppText variant="bodySemibold" style={{ flex: 1, fontSize: 16 }}>
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
                {tariff.totalPriceGroups.map((g, gi) => (
                  <View key={g.heading}>
                    <AppText variant="small" tone={g.tone} style={gi > 0 ? { marginTop: 8 } : { marginBottom: 4 }}>
                      {g.heading}
                    </AppText>
                    {g.rows.map((r) => (
                      <View key={r.label} style={styles.rate}>
                        <AppText variant="body">{r.label}</AppText>
                        <AppText variant="body" style={tabular}>
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
            <AppText variant="bodySemibold" style={{ marginTop: 20, fontSize: 16 }}>
              Want some more?
            </AppText>
            <Tap
              pressScale={0.99}
              accessibilityRole="button"
              accessibilityLabel={`${tariff.bannerAlt} Learn more`}
              onPress={() => (tariff.bannerLink ? router.push(tariff.bannerLink as Href) : toast('This page is not part of this prototype yet'))}
              style={{ marginTop: 12 }}>
              <Image
                source={bannerWantMore}
                contentFit="cover"
                style={{ width: '100%', aspectRatio: bannerWantMoreAspect, borderRadius: radius.lg + 2 }}
              />
            </Tap>
            <View style={styles.note}>
              <AppText variant="caption" tone="accent">
                {tariff.chargingNote}
              </AppText>
            </View>
            <View style={{ marginTop: 16 }}>
              <HelpCard color={colors.cardRaised} />
            </View>
          </Animated.View>
        </View>
      </CollapsingScreen>

      <Sheet visible={manage} onClose={() => setManage(false)} title="Manage tariff">
        <Divider style={{ marginHorizontal: -layout.gutter }} />
        <ListRow
          icon={<SketchLogo size={22} color={colors.accentIcon} weight="regular" />}
          label="Redesign for next renewal"
          onPress={() => leaveFromSheet('/my-tariff/redesign')}
        />
        <ListRow
          icon={<ArrowCounterClockwise size={22} color={colors.accentIcon} weight="regular" />}
          label="Renew tariff"
          onPress={() => {
            setManage(false);
            // Let the Manage sheet finish closing before a second modal opens.
            setTimeout(() => setRenew(true), 260);
          }}
        />
        <ListRow
          icon={<ArrowsLeftRight size={22} color={colors.accentIcon} weight="regular" />}
          label="Change tariff"
          onPress={() => leaveFromSheet('/my-tariff/change')}
        />
      </Sheet>

      <Sheet visible={renew} onClose={() => setRenew(false)} centered>
        <View style={{ alignItems: 'center' }}>
          <LinearGradient colors={ctaGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.renewIcon}>
            <ArrowCounterClockwise size={30} color={colors.text} weight="regular" />
          </LinearGradient>
          <AppText variant="title" style={{ fontSize: 20, marginTop: 14 }}>
            {tariff.renew.title}
          </AppText>
          <AppText variant="caption" tone="secondary" style={{ marginTop: 8, paddingHorizontal: 12, textAlign: 'center' }}>
            {tariff.renew.body}
          </AppText>
        </View>
        <View style={{ marginTop: 20, gap: 10 }}>
          <Button label="Cancel" variant="outline" size="lg" onPress={() => setRenew(false)} />
          <Button
            label="Renew"
            variant="gradient"
            size="lg"
            onPress={() => {
              setRenew(false);
              void runTariffAction(() => renewTariff(), toast, applyMoney, (res) => `${res.tariff.title} renewed for ${res.tariff.price} ₼`);
            }}
          />
        </View>
      </Sheet>
    </>
  );
}

function Amount({ value, unit }: { value: string; unit: string }) {
  return (
    <AppText variant="title" style={[{ fontSize: 24, lineHeight: 30 }, tabular]}>
      {value}
      <AppText variant="body" style={{ fontSize: 15 }}>
        {' '}
        {unit}
      </AppText>
    </AppText>
  );
}

const styles = StyleSheet.create({
  headLine: { flexDirection: 'row', alignItems: 'baseline', gap: 10 },
  headText: { fontSize: 14, lineHeight: 18 },
  // 40pt below the pills keeps the gradient behind the panel's rounded corners and leaves the recorded 20pt gap
  pills: { flexDirection: 'row', gap: 8, marginTop: 14, marginBottom: 40 },
  pill: { backgroundColor: '#344BC5', borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 5 },
  pillText: { color: '#D6DDFF', fontSize: 10, lineHeight: 14, letterSpacing: 0.4 },
  // Full-bleed body panel that overlaps the header gradient so its rounded top shows the gradient.
  panel: {
    marginHorizontal: -layout.gutter,
    marginTop: -42,
    marginBottom: -24,
    paddingHorizontal: layout.gutter,
    paddingTop: 34,
    paddingBottom: 24,
    backgroundColor: tariffSurface,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  usage: { paddingVertical: 10 },
  usageHead: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 24 },
  whatsapp: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#25D366', alignItems: 'center', justifyContent: 'center' },
  usageValues: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  detail: { height: 38, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  redesign: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: radius.xl - 2, padding: 18 },
  redesignDisc: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4350CC',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  total: { marginTop: 14, paddingHorizontal: 18, backgroundColor: colors.cardRaised, borderRadius: radius.lg, overflow: 'hidden' },
  totalHead: { height: 54, flexDirection: 'row', alignItems: 'center' },
  rate: { height: 38, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  note: { marginTop: 12, height: 38, backgroundColor: colors.noteBg, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  renewIcon: { width: 62, height: 62, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
});
