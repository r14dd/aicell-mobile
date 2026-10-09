import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ArrowCounterClockwise, Broadcast, Phone, WhatsappLogo } from '@/components/icons';
import { NavHeader } from '@/components/NavHeader';
import { AppText, tabular } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Tap } from '@/components/ui/Tap';
import { longDate } from '@/api/client';
import { getInsights, INSIGHTS_KEY } from '@/api/insights';
import { useQuery } from '@/api/query';
import { getMyUsage } from '@/api/tariffs';
import { myTariffHeader, tariffSurface, usage as seedUsage, type UsageKind } from '@/data/myTariff';
import { colors, headerGradient, layout } from '@/theme/tokens';

const barColor: Record<UsageKind, string> = { internet: colors.blue, messaging: colors.blue, calls: colors.accent };
const SHEET_RADIUS = 20;

export default function RemainingBalanceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const remote = useQuery('tariffs/my/usage/', getMyUsage).data;
  const usage = remote
    ? remote.rows.map((r) => ({ kind: r.kind, label: r.label, remaining: r.remaining, remainingUnit: r.remaining_unit.toUpperCase(), total: r.total, totalUnit: r.total_unit.toUpperCase(), ratio: r.ratio }))
    : seedUsage;
  const title = remote?.tariff ?? myTariffHeader.title;
  const insights = useQuery(INSIGHTS_KEY, getInsights).data?.results ?? [];
  const warning = insights.find((i) => i.kind === 'overage' || i.kind === 'forecast_gap');
  const note = !warning
    ? null
    : warning.kind === 'overage'
      ? `Out of package today: ${String(warning.evidence.overage_amount)} ₼ at ${String(warning.evidence.rate_per_mb)} ₼ per MB`
      : `At this pace your internet runs out on ${longDate(String(warning.evidence.empty_on))}`;
  const periodLeft = remote ? `${remote.period_left.days} d. ${remote.period_left.hours} h.` : '18 d. 21 h.';

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <LinearGradient
        colors={headerGradient}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={{ paddingTop: Math.max(insets.top, 14), paddingBottom: SHEET_RADIUS + 3 }}>
        <View style={{ paddingHorizontal: layout.gutter }}>
          <NavHeader title="Remaining balance" subtitle={null} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.body}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}>
        <Tap
          pressScale={0.99}
          accessibilityRole="button"
          accessibilityLabel={`${title} tariff`}
          onPress={() => router.push('/my-tariff')}
          style={{ marginHorizontal: layout.gutter, marginTop: 26 }}>
          <Card color={tariffSurface} style={{ padding: 20 }}>
            <View style={styles.titleRow}>
              <AppText variant="title">{title}</AppText>
              <View style={styles.renewal}>
                <ArrowCounterClockwise size={14} color={colors.textSecondary} />
                <AppText variant="caption" tone="secondary">
                  {periodLeft}
                </AppText>
              </View>
            </View>

            <View style={{ marginTop: 35 }}>
              {usage.map((u, i) => (
                <View key={u.kind} style={i > 0 ? { marginTop: 26 } : null}>
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
                  </View>
                  <View style={{ marginTop: 8 }}>
                    <ProgressBar value={u.ratio} color={barColor[u.kind]} />
                  </View>
                  <View style={styles.usageValues}>
                    <Amount value={u.remaining} unit={u.remainingUnit} />
                    <Amount value={u.total} unit={u.totalUnit} />
                  </View>
                  {u.kind === 'internet' && note ? (
                    <AppText variant="caption" tone="accent" style={{ marginTop: 8 }}>
                      {note}
                    </AppText>
                  ) : null}
                </View>
              ))}
            </View>
          </Card>
        </Tap>
      </ScrollView>
    </View>
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
  body: { flex: 1, marginTop: -SHEET_RADIUS, borderTopLeftRadius: SHEET_RADIUS, borderTopRightRadius: SHEET_RADIUS, backgroundColor: colors.bg },
  titleRow: { marginTop: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  renewal: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  usageHead: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 24 },
  whatsapp: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#25D366', alignItems: 'center', justifyContent: 'center' },
  usageValues: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
});
