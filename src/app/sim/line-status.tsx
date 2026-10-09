import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { errorMessage, num } from '@/api/client';
import { useQuery } from '@/api/query';
import { closeLine, getLineStatus, longDay } from '@/api/sim';
import { Check, Coins } from '@/components/icons';
import { NavHeader } from '@/components/NavHeader';
import { useToast } from '@/components/Toast';
import { AppText, tabular } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { money } from '@/data/mock';
import { surface } from '@/data/notifications';
import { lineStatusText as t } from '@/data/simSettings';
import { colors, font, headerGradient, layout } from '@/theme/tokens';

const SHEET_RADIUS = 20;
const OPEN_GREEN = '#4BB509';
const paragraph = { fontSize: 15, lineHeight: 19 } as const;

export default function LineStatusScreen() {
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const status = useQuery('sim/line/status/', getLineStatus).data;
  const general = status?.general ?? t.general;
  const fee = status ? num(status.fee) : t.fee;
  const suspendedDate = status ? longDay(status.suspend_until) : t.suspendedDate;
  const consequences = status?.consequences ?? t.consequences;
  const closeLabel = status?.cta ?? t.closeLine;

  return (
    <View style={{ flex: 1, backgroundColor: surface }}>
      <LinearGradient
        colors={headerGradient}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={{ paddingTop: Math.max(insets.top, 14), paddingBottom: SHEET_RADIUS + 22 }}>
        <View style={{ paddingHorizontal: layout.gutter }}>
          <NavHeader title="" subtitle={null} />
        </View>
        <View style={styles.titleRow}>
          <View style={styles.check}>
            <Check size={15} color="#FFFFFF" weight="bold" />
          </View>
          <AppText variant="display" style={{ flex: 1 }}>
            {t.title}
          </AppText>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.body}
        contentContainerStyle={{ paddingHorizontal: layout.gutter, paddingTop: 26, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}>
        <AppText variant="caption" tone="secondary">
          {t.generalLabel}
        </AppText>
        <AppText style={[paragraph, { marginTop: 16 }]}>{general}</AppText>

        <AppText variant="caption" tone="secondary" style={{ marginTop: 24 }}>
          {t.detailsLabel}
        </AppText>
        <View style={styles.feeRow}>
          <Coins size={24} color={colors.accent} />
          <AppText style={[paragraph, { flex: 1 }]}>{t.feeLabel}</AppText>
          <AppText variant="bodySemibold" style={tabular}>
            {money(fee)} ₼
          </AppText>
        </View>

        <AppText style={[paragraph, { marginTop: 16 }]}>
          {t.suspendedBefore}
          <AppText style={[paragraph, { fontFamily: font.semibold }]}>{suspendedDate}</AppText>
          {t.suspendedAfter}
        </AppText>

        <View style={{ marginTop: 24, gap: 11 }}>
          {consequences.map((line) => (
            <View key={line} style={styles.bullet}>
              <View style={styles.dot} />
              <AppText style={[paragraph, { flex: 1 }]}>{line}</AppText>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
        <Button variant="gradient" size="lg" label={closeLabel} onPress={() => closeLine().catch((e: unknown) => toast(errorMessage(e)))} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16, paddingHorizontal: layout.gutter },
  check: { width: 24, height: 24, borderRadius: 12, backgroundColor: OPEN_GREEN, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, marginTop: -SHEET_RADIUS, borderTopLeftRadius: SHEET_RADIUS, borderTopRightRadius: SHEET_RADIUS, backgroundColor: surface },
  feeRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 14, minHeight: 24 },
  bullet: { flexDirection: 'row', alignItems: 'flex-start', gap: 17, paddingLeft: 8 },
  dot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#FFFFFF', marginTop: 6 },
  footer: { paddingHorizontal: 14, paddingTop: 12, backgroundColor: surface },
});
