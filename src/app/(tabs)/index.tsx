import { Image } from 'expo-image';
import { useRouter, type Href } from 'expo-router';
import { useRef, useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { BannerCarousel } from '@/components/BannerCarousel';
import { GradientScreen } from '@/components/GradientScreen';
import { Broadcast, CaretRight, ChartPieSlice, DeviceMobile, Eye, EyeSlash, Info, Phone, SimCard } from '@/components/icons';
import { LotteryBanner } from '@/components/LotteryBanner';
import { QuickActionBar, type QuickAction } from '@/components/QuickActionBar';
import { Sheet } from '@/components/Sheet';
import { StoryChip } from '@/components/StoryChip';
import { useToast } from '@/components/Toast';
import { TopBar } from '@/components/TopBar';
import { AppText, tabular } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Divider } from '@/components/ui/Divider';
import { Pill } from '@/components/ui/Pill';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Tap } from '@/components/ui/Tap';
import { num } from '@/api/client';
import { getHome } from '@/api/content';
import { getInsights, INSIGHTS_KEY, type InsightKind } from '@/api/insights';
import { useQuery } from '@/api/query';
import { img } from '@/data/assets';
import { getMyUsage } from '@/api/tariffs';
import { homeBanners, homeStories, money, subscriber, type Banner, type Story } from '@/data/mock';
import { useLayaTarget } from '@/laya/targets';
import { useAccount } from '@/state/account';
import { stories } from '@/data/stories';
import { useStories } from '@/state/stories';
import { colors, font, layout } from '@/theme/tokens';

const INSIGHT_HEADLINE: Record<InsightKind, string> = {
  social_heavy: 'Social networks are most of your data',
  video_heavy: 'Video used up your pack',
  repeat_packs: 'You keep buying add-on packs',
  overage: 'Paying per megabyte right now',
  forecast_gap: 'Internet will run out early',
  underused: 'Half your internet goes unused',
  roaming: 'Roaming without a pack',
  renewal_shortfall: 'Renewal is short',
};

export default function HomeScreen() {
  const router = useRouter();
  const topUpRef = useRef<View>(null);
  useLayaTarget('home.topUp', topUpRef, { press: () => router.push('/top-up') });
  const toast = useToast();
  const [hidden, setHidden] = useState(false);
  const [aggregation, setAggregation] = useState(false);
  const { viewed } = useStories();
  const { balance, topUpsThisMonth, transactions } = useAccount();
  const home = useQuery('content/home/', getHome).data;
  const usage = useQuery('tariffs/my/usage/', getMyUsage).data;
  const insightList = useQuery(INSIGHTS_KEY, getInsights).data?.results ?? [];
  const insightCount = insightList.length;
  const insightHeadline = insightCount ? INSIGHT_HEADLINE[insightList[0].kind] : 'Your usage, explained';
  // Server feed with the app's own artwork by key; unknown keys fall back to the server image.
  const storyByKey = new Map(homeStories.map((s) => [s.key, s]));
  const bannerByKey = new Map(homeBanners.map((b) => [b.key, b]));
  // Chips the server lists without artwork in this build (its image files 404) are left out rather than shown empty.
  const shelf: Story[] = home ? home.stories.filter((s) => storyByKey.has(s.key)).map((s) => ({ key: s.key, label: s.label, image: storyByKey.get(s.key)?.image ?? { uri: s.image } })) : homeStories;
  const isViewed = (key: string) => viewed.has(key) || !!home?.stories.find((s) => s.key === key)?.viewed;
  const orderedStories = [...shelf.filter((s) => !isViewed(s.key)), ...shelf.filter((s) => isViewed(s.key))];
  const banners: Banner[] = home
    ? home.banners.map((b) => {
        const local = bannerByKey.get(b.key);
        const href = (b.deep_link ?? local?.href) as Href | undefined;
        return { key: b.key, image: local?.image ?? { uri: b.image }, alt: b.alt, href, note: href ? undefined : (local?.note ?? `${b.alt} is not part of this prototype yet`) };
      })
    : homeBanners;

  const quickActions: QuickAction[] = [
    {
      key: 'simkredit',
      label: 'SimKredit',
      icon: <ChartPieSlice size={24} color={colors.text} weight="light" />,
      onPress: () => router.push('/kredit'),
    },
    {
      key: 'internet',
      label: 'Buy internet',
      icon: <Broadcast size={24} color={colors.text} weight="light" />,
      onPress: () => router.push('/internet-packs'),
    },
    {
      key: 'sim',
      label: 'SIM settings',
      icon: <SimCard size={24} color={colors.text} weight="light" />,
      onPress: () => router.push('/sim-settings'),
    },
  ];

  const remaining = usage
    ? { dataGb: num(usage.remaining.data_gb), dataTotalGb: num(usage.remaining.data_total_gb), minutes: usage.remaining.minutes, minutesTotal: usage.remaining.minutes_total }
    : subscriber.remaining;
  const tariffName = usage?.tariff ?? subscriber.tariff.name;
  const tariffRenewal = usage?.renewal_label ?? subscriber.tariff.renewal;

  return (
    <GradientScreen
      pinned={<TopBar />}
      header={
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 22, gap: 22, paddingTop: 12 }}>
            {orderedStories.map((s) => (
              <StoryChip
                key={s.key}
                label={s.label}
                image={s.image}
                viewed={isViewed(s.key)}
                onPress={() => (stories[s.key] ? router.push({ pathname: '/story/[key]', params: { key: s.key } }) : toast(`The ${s.label} story is not part of this prototype yet`))}
              />
            ))}
          </ScrollView>
          <View style={{ paddingHorizontal: layout.gutter, marginTop: 20, gap: 16 }}>
            <QuickActionBar actions={quickActions} />
            <LotteryBanner subtitle={home?.lottery.subtitle} />
          </View>
        </>
      }>
      {/* Main balance */}
      <Card>
        <View style={styles.between}>
          <AppText variant="subheading" style={styles.cardTitle}>
            Main balance
          </AppText>
          <View ref={topUpRef} collapsable={false}>
            <Button label="Top up" size="sm" onPress={() => router.push('/top-up')} />
          </View>
        </View>
        <View style={[styles.row, { marginTop: 6, gap: 14 }]}>
          <Amount value={balance} hidden={hidden} />
          <Tap
            hitSlop={10}
            haptic={false}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Show balance' : 'Hide balance'}
            onPress={() => setHidden((h) => !h)}>
            {hidden ? (
              <EyeSlash size={24} color={colors.accentIcon} weight="regular" />
            ) : (
              <Eye size={24} color={colors.accentIcon} weight="regular" />
            )}
          </Tap>
        </View>
        <Divider style={{ marginVertical: 18 }} />
        <Tap
          haptic={false}
          pressScale={0.99}
          accessibilityRole="button"
          accessibilityLabel={`${tariffName}, my tariff`}
          onPress={() => router.push('/my-tariff')}
          style={styles.between}>
          <View style={{ gap: 6 }}>
            <View style={[styles.row, { gap: 10 }]}>
              <AppText variant="subheading" style={styles.cardTitle}>
                {tariffName}
              </AppText>
              <Pill tone="soft" label="MY TARIFF" />
            </View>
            <AppText variant="caption" tone="secondary">
              {tariffRenewal}
            </AppText>
          </View>
          <CaretRight size={20} color={colors.textTertiary} />
        </Tap>
      </Card>

      {/* Remaining balance */}
      <Card style={{ marginTop: 12 }}>
        {/* two sibling controls: the title and chevron open the page, the info icon opens the aggregation sheet */}
        <View style={styles.between}>
          <View style={[styles.row, { gap: 8 }]}>
            <Tap
              haptic={false}
              pressScale={0.99}
              accessibilityRole="button"
              accessibilityLabel="Remaining balance details"
              onPress={() => router.push('/remaining-balance')}>
              <AppText variant="subheading" style={styles.cardTitle}>
                Remaining balance
              </AppText>
            </Tap>
            <Tap hitSlop={10} haptic={false} accessibilityRole="button" accessibilityLabel="Balances aggregation" onPress={() => setAggregation(true)}>
              <Info size={18} color={colors.info} weight="regular" />
            </Tap>
          </View>
          <Tap
            hitSlop={10}
            haptic={false}
            accessibilityRole="button"
            accessibilityLabel="Open remaining balance"
            onPress={() => router.push('/remaining-balance')}>
            <CaretRight size={20} color={colors.textTertiary} />
          </Tap>
        </View>
        <View style={[styles.row, { gap: 16, marginTop: 18 }]}>
          <Metric
            icon={<Broadcast size={22} color={colors.accentIcon} weight="regular" />}
            value={hidden ? '•••' : money(remaining.dataGb)}
            unit="GB"
            progress={remaining.dataGb / remaining.dataTotalGb}
            color={colors.blue}
          />
          <Metric
            icon={<Phone size={22} color={colors.accentIcon} weight="regular" />}
            value={hidden ? '•••' : String(remaining.minutes)}
            unit="MIN."
            progress={remaining.minutes / remaining.minutesTotal}
            color={colors.accent}
          />
        </View>
      </Card>

      <View style={{ marginTop: 16 }}>
        <BannerCarousel items={banners} aspect={2.83} />
      </View>

      {/* AIsel insights */}
      <Tap pressScale={0.99} accessibilityRole="button" accessibilityLabel="AIsel insights" onPress={() => router.push('/insights')} style={{ marginTop: 12 }}>
        <Card>
          <View style={[styles.row, { gap: 12 }]}>
            <Image source={img.avatarRobotIdleHd} style={{ width: 44, height: 44, borderRadius: 22 }} contentFit="cover" />
            <View style={{ flex: 1, gap: 2 }}>
              <AppText variant="subheading" style={styles.cardTitle}>
                AIsel insights
              </AppText>
              <AppText variant="caption" tone="secondary" numberOfLines={1}>
                {insightHeadline}
              </AppText>
            </View>
            {insightCount ? <Pill tone="soft" label={String(insightCount)} /> : null}
            <CaretRight size={20} color={colors.textTertiary} />
          </View>
        </Card>
      </Tap>

      {/* Top-ups */}
      <Card style={{ marginTop: 16 }}>
        <Tap
          haptic={false}
          pressScale={0.99}
          accessibilityRole="button"
          accessibilityLabel="Top-ups in October, payment history"
          onPress={() => router.push('/top-ups')}
          style={styles.between}>
          <AppText variant="subheading" style={styles.cardTitle}>
            Top-ups in October
          </AppText>
          <CaretRight size={20} color={colors.textTertiary} />
        </Tap>
        <AppText variant="title" style={[tabular, { fontSize: 28, marginTop: 8 }]}>
          {money(topUpsThisMonth)} ₼
        </AppText>
        <AppText variant="caption" tone="secondary" style={{ marginTop: 18 }}>
          Recent transactions
        </AppText>
        {transactions.map((t) => (
          <View key={t.id} style={[styles.row, { gap: 14, marginTop: 16 }]}>
            <View style={styles.txIcon}>
              <DeviceMobile size={22} color={colors.accentLink} weight="light" />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <AppText variant="body" style={{ fontSize: 17 }}>
                {t.title}
              </AppText>
              <AppText variant="caption" tone="secondary">
                {t.date}
              </AppText>
            </View>
            <AppText variant="bodySemibold" tone={t.amount < 0 ? 'primary' : 'green'} style={tabular}>
              {t.amount < 0 ? '-' : '+'}{money(Math.abs(t.amount))} ₼
            </AppText>
          </View>
        ))}
      </Card>

      <Sheet visible={aggregation} onClose={() => setAggregation(false)} title="Balances aggregation">
        <View style={{ marginTop: 6 }}>
          <View style={[styles.row, { gap: 10 }]}>
            <Broadcast size={18} color={colors.accentIcon} weight="regular" />
            <AppText variant="bodySemibold" style={{ fontSize: 15 }}>
              For internet
            </AppText>
          </View>
          <AppText variant="caption" tone="secondary" style={{ marginTop: 8, lineHeight: 19 }}>
            The general-purpose internet balance for countrywide usage is displayed ONLY.
          </AppText>
          <View style={[styles.row, { gap: 10, marginTop: 18 }]}>
            <Phone size={18} color={colors.accentIcon} weight="regular" />
            <AppText variant="bodySemibold" style={{ fontSize: 15 }}>
              For calls
            </AppText>
          </View>
          <AppText variant="caption" tone="secondary" style={{ marginTop: 8, lineHeight: 19, marginBottom: 8 }}>
            All types of minutes for countrywide usage are aggregated (no matter what types on-net & off-net & local)
          </AppText>
        </View>
      </Sheet>
    </GradientScreen>
  );
}

/** Balance figure: whole part large, decimals smaller, manat sign last. */
function Amount({ value, hidden }: { value: number; hidden: boolean }) {
  const [whole, cents] = money(value).split('.');
  return (
    <View style={[styles.row, { alignItems: 'baseline' }]} accessibilityLabel={hidden ? 'Balance hidden' : `${money(value)} manat`}>
      {hidden ? (
        <AppText style={[styles.amountBig, { letterSpacing: 1 }]}>•••</AppText>
      ) : (
        <>
          <AppText style={[styles.amountBig, tabular]}>{whole}</AppText>
          <AppText style={[styles.amountSmall, tabular]}>.{cents}</AppText>
        </>
      )}
      <AppText style={styles.amountUnit}> ₼</AppText>
    </View>
  );
}

function Metric({ icon, value, unit, progress, color }: { icon: ReactNode; value: string; unit: string; progress: number; color: string }) {
  return (
    <View style={{ flex: 1 }}>
      <View style={[styles.row, { gap: 8, alignItems: 'baseline' }]}>
        <View style={{ alignSelf: 'center' }}>{icon}</View>
        <AppText variant="title" style={[tabular, { fontSize: 28 }]}>
          {value}
        </AppText>
        <AppText variant="captionMedium" tone="secondary">
          {unit}
        </AppText>
      </View>
      <View style={{ marginTop: 12 }}>
        <ProgressBar value={progress} color={color} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { fontFamily: font.regular },
  amountBig: { fontFamily: font.bold, fontSize: 34, lineHeight: 40, color: colors.text, letterSpacing: -1 },
  amountSmall: { fontFamily: font.bold, fontSize: 22, lineHeight: 28, color: colors.text, letterSpacing: -0.5 },
  amountUnit: { fontFamily: font.medium, fontSize: 17, lineHeight: 22, color: colors.text },
  txIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
