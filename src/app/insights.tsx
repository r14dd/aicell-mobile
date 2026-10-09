import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { longDate } from '@/api/client';
import { ADVISOR_KEY, getAdvisor, getInsights, INSIGHTS_KEY, type Insight, type InsightKind } from '@/api/insights';
import { useQuery } from '@/api/query';
import { getRecommendations, getUsageSummary, RECOMMENDATIONS_KEY, type Recommendation } from '@/api/usage';
import { ArrowCounterClockwise, Broadcast, CaretRight, CellSignalFull, InstagramLogo, MonitorPlay, Phone, Star } from '@/components/icons';
import { NavHeader } from '@/components/NavHeader';
import { AppText, tabular } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Tap } from '@/components/ui/Tap';
import { tariffSurface } from '@/data/myTariff';
import { useAysel } from '@/state/aysel';
import { colors, headerGradient, layout, radius } from '@/theme/tokens';

const SHEET_RADIUS = 20;
const SUMMARY_KEY = 'usage/summary/?days=30';

const KIND: Record<InsightKind, { title: string; icon: ReactNode; color: string }> = {
  social_heavy: { title: 'Social networks are most of your data', icon: <InstagramLogo size={20} color={colors.text} weight="fill" />, color: '#E1306C' },
  video_heavy: { title: 'Video used up your pack', icon: <MonitorPlay size={20} color={colors.text} weight="fill" />, color: '#FF0000' },
  repeat_packs: { title: 'You keep buying add-on packs', icon: <ArrowCounterClockwise size={20} color={colors.text} weight="bold" />, color: '#5B3BE0' },
  overage: { title: 'Paying per megabyte', icon: <Broadcast size={20} color={colors.text} weight="bold" />, color: '#D64545' },
  forecast_gap: { title: 'Internet will run out early', icon: <Broadcast size={20} color={colors.text} weight="bold" />, color: '#4670E2' },
  underused: { title: 'Half your internet goes unused', icon: <Broadcast size={20} color={colors.text} weight="bold" />, color: '#2E9E6B' },
  roaming: { title: 'Roaming without a pack', icon: <CellSignalFull size={20} color={colors.text} weight="bold" />, color: '#4670E2' },
  renewal_shortfall: { title: 'Renewal is short', icon: <Phone size={20} color={colors.text} weight="bold" />, color: '#D64545' },
};

const n = (v: unknown) => (typeof v === 'number' ? String(Math.round(v * 10) / 10) : String(v ?? ''));
const pct = (v: unknown) => (typeof v === 'number' ? `${Math.round(v * 100)}%` : '');

/** One line of the figures behind an insight, from the fixed evidence fields of its kind. */
function evidenceLine(i: Insight) {
  const e = i.evidence as Record<string, unknown>;
  const apps = (e.by_app_gb ?? {}) as Record<string, number>;
  const pack = (e.pack ?? {}) as Record<string, unknown>;
  const periods = (e.periods ?? []) as Record<string, unknown>[];
  switch (i.kind) {
    case 'social_heavy':
      return `Instagram & Facebook ${n(apps.instagram_facebook)} GB a month, ${pct(e.social_share)} of your data`;
    case 'video_heavy':
      return `A ${n(pack.data_gb)} GB pack gone in ${n(pack.days)} days, ${n(apps.youtube)} GB of it YouTube`;
    case 'repeat_packs':
      return `${n(e.data_gb_month)} GB a month and ${n(e.monthly_spend)} ₼ in all, packs included`;
    case 'overage':
      return `${n(e.overage_mb)} MB out of package today cost ${n(e.overage_amount)} ₼`;
    case 'forecast_gap':
      return `${n(e.remaining_gb)} GB left for ${n(e.days_left)} days, empty on ${longDate(String(e.empty_on))}`;
    case 'underused':
      return `${n(periods[0]?.unused_gb)} GB left over last period, ${n(e.included_gb)} GB included`;
    case 'roaming':
      return `${n(e.roaming_mb)} MB in roaming over ${n(e.days)} days without a pack`;
    case 'renewal_shortfall':
      return `${n(e.shortfall)} ₼ short for the renewal on ${longDate(String(e.renews_at))}`;
    default:
      return '';
  }
}

/** Everything AIsel has to say about this number: the server's insights, recommendations and the open offer. */
export default function InsightsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { discuss } = useAysel();
  const insights = useQuery(INSIGHTS_KEY, getInsights).data?.results ?? [];
  const summary = useQuery(SUMMARY_KEY, () => getUsageSummary(30)).data;
  const recs = useQuery(RECOMMENDATIONS_KEY, getRecommendations).data;
  const advisor = useQuery(ADVISOR_KEY, getAdvisor).data;
  const plus = advisor?.recommended === 'istesen-plus' ? advisor.candidates.find((c) => c.id === 'istesen-plus') : undefined;
  const empty = insights.length === 0 && !recs?.recommendations.length && !recs?.offer && !plus;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <LinearGradient colors={headerGradient} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={{ paddingTop: Math.max(insets.top, 14), paddingBottom: SHEET_RADIUS + 3 }}>
        <View style={{ paddingHorizontal: layout.gutter }}>
          <NavHeader title="AIsel insights" subtitle={null} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.body} contentContainerStyle={{ paddingHorizontal: layout.gutter, paddingTop: 24, paddingBottom: insets.bottom + 32, gap: 12 }} showsVerticalScrollIndicator={false}>
        {summary ? (
          <Card color={tariffSurface}>
            <AppText variant="label" tone="secondary">
              {summary.segment.label.toUpperCase()}
            </AppText>
            <AppText variant="bodyMedium" style={{ marginTop: 6, fontSize: 16, lineHeight: 22 }}>
              {summary.headline}
            </AppText>
          </Card>
        ) : null}

        {insights.length ? <AppText variant="subheading" style={styles.section}>AIsel noticed</AppText> : null}
        {insights.map((i) => {
          const kind = KIND[i.kind];
          const offer = i.offers[i.recommended] ?? i.offers[0];
          return (
            <Card key={i.id} color={tariffSurface}>
              <View style={styles.head}>
                <View style={[styles.badge, { backgroundColor: kind.color }]}>{kind.icon}</View>
                <AppText variant="bodySemibold" style={{ flex: 1, fontSize: 16, lineHeight: 22 }}>
                  {kind.title}
                </AppText>
              </View>
              <AppText variant="caption" tone="secondary" style={{ marginTop: 10 }}>
                {evidenceLine(i)}
              </AppText>
              {offer ? (
                <View style={styles.offer}>
                  <AppText variant="body" style={{ flex: 1 }}>
                    {offer.label}
                  </AppText>
                  <AppText variant="bodySemibold" style={tabular}>
                    {`${offer.price} ₼`}
                  </AppText>
                  {offer.saving ? (
                    <AppText variant="caption" style={{ color: '#5FD39A' }}>
                      {`saves ${offer.saving} ₼/mo`}
                    </AppText>
                  ) : null}
                </View>
              ) : null}
              <Button label="Talk to AIsel" variant="gradient" size="md" style={{ marginTop: 14 }} onPress={() => discuss(i)} />
            </Card>
          );
        })}

        {plus && advisor ? (
          <Tap pressScale={0.99} accessibilityRole="button" accessibilityLabel="IsteSen+" onPress={() => router.push({ pathname: '/my-tariff/redesign', params: { values: JSON.stringify(plus.redesign ?? {}) } })}>
            <Card color={tariffSurface}>
              <View style={styles.head}>
                <View style={[styles.badge, { backgroundColor: '#6C6AF0' }]}>
                  <Star size={20} color={colors.text} weight="fill" />
                </View>
                <View style={{ flex: 1 }}>
                  <AppText variant="bodySemibold" style={{ fontSize: 16, lineHeight: 22 }}>
                    {`${plus.title} fits you better`}
                  </AppText>
                  <AppText variant="caption" tone="secondary" style={{ marginTop: 2 }}>
                    {`${plus.price} ₼ a month instead of ${advisor.current.total_month} ₼ · from ${longDate(advisor.effective_from)}`}
                  </AppText>
                </View>
                <CaretRight size={20} color={colors.textTertiary} />
              </View>
            </Card>
          </Tap>
        ) : null}

        {recs?.recommendations.length ? <AppText variant="subheading" style={styles.section}>Recommended for you</AppText> : null}
        {recs?.recommendations.map((r) => <RecommendationCard key={`${r.kind}:${r.target_id}`} item={r} onPress={() => router.push(r.action.to as Href)} />)}

        {recs?.offer ? (
          <Tap pressScale={0.99} accessibilityRole="button" accessibilityLabel="Personal offer" onPress={() => router.push(recs.offer!.action.to as Href)}>
            <Card color={tariffSurface}>
              <AppText variant="label" tone="secondary">
                PERSONAL OFFER
              </AppText>
              <View style={[styles.head, { marginTop: 8 }]}>
                <AppText variant="bodySemibold" style={{ flex: 1, fontSize: 16, lineHeight: 22 }}>
                  {recs.offer.title}
                </AppText>
                <AppText variant="bodySemibold" style={tabular}>
                  {`${recs.offer.offer_price} ₼`}
                </AppText>
                <AppText variant="caption" tone="secondary" style={[styles.was, tabular]}>
                  {`${recs.offer.normal_price} ₼`}
                </AppText>
              </View>
              <AppText variant="caption" tone="secondary" style={{ marginTop: 6 }}>
                {recs.offer.reason}
              </AppText>
            </Card>
          </Tap>
        ) : null}

        {empty ? (
          <AppText variant="body" tone="secondary" style={{ textAlign: 'center', marginTop: 24 }}>
            {recs?.fits ? 'Your current plan fits how you use your number.' : 'Nothing to tell yet.'}
          </AppText>
        ) : null}
      </ScrollView>
    </View>
  );
}

function RecommendationCard({ item, onPress }: { item: Recommendation; onPress: () => void }) {
  const saving = Number(item.saving);
  return (
    <Card color={tariffSurface}>
      <View style={styles.head}>
        <AppText variant="bodySemibold" style={{ flex: 1, fontSize: 16, lineHeight: 22 }}>
          {item.title}
        </AppText>
        <AppText variant="caption" style={{ color: saving >= 0 ? '#5FD39A' : colors.textSecondary }}>
          {saving >= 0 ? `saves ${item.saving} ₼/mo` : `${item.projected_monthly_cost} ₼/mo`}
        </AppText>
      </View>
      <View style={{ marginTop: 8, gap: 4 }}>
        {item.evidence.map((line) => (
          <AppText key={line} variant="caption" tone="secondary">
            {`· ${line}`}
          </AppText>
        ))}
      </View>
      <Button label={item.action.label} variant="outline" size="md" style={{ marginTop: 14 }} onPress={onPress} />
    </Card>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, marginTop: -SHEET_RADIUS, borderTopLeftRadius: SHEET_RADIUS, borderTopRightRadius: SHEET_RADIUS, backgroundColor: colors.bg },
  section: { marginTop: 8, marginBottom: 2 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  badge: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  offer: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12, paddingHorizontal: 12, paddingVertical: 10, borderRadius: radius.md, backgroundColor: colors.cardRaised },
  was: { textDecorationLine: 'line-through' },
});
