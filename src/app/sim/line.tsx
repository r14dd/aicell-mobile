import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { errorMessage } from '@/api/client';
import { setQueryData, useQuery } from '@/api/query';
import { getLine, patchLine, requestInternetSettings } from '@/api/sim';
import { CaretRight } from '@/components/icons';
import { HelpCard } from '@/components/HelpCard';
import { NavHeader } from '@/components/NavHeader';
import { useToast } from '@/components/Toast';
import { AppText } from '@/components/ui/AppText';
import { Tap } from '@/components/ui/Tap';
import { Toggle } from '@/components/ui/Toggle';
import { surface } from '@/data/notifications';
import { lineSettingsText as t } from '@/data/simSettings';
import { colors, headerGradient, layout } from '@/theme/tokens';

const SHEET_RADIUS = 20;

export default function LineSettingsScreen() {
  const router = useRouter();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const line = useQuery('sim/line/', getLine).data;
  // The switch flips at once; the server's answer replaces the cached settings and an error restores them.
  const [pending, setPending] = useState<{ mobile_internet?: boolean; second_line?: boolean }>({});
  const internet = pending.mobile_internet ?? line?.mobile_internet ?? true;
  const secondLine = pending.second_line ?? line?.second_line ?? true;
  const update = (patch: { mobile_internet?: boolean; second_line?: boolean }) => {
    setPending((p) => ({ ...p, ...patch }));
    patchLine(patch)
      .then((res) => setQueryData('sim/line/', res))
      .catch((e: unknown) => toast(errorMessage(e)))
      .finally(() => setPending({}));
  };
  const setInternet = (v: boolean) => update({ mobile_internet: v });
  const setSecondLine = (v: boolean) => update({ second_line: v });
  const statusTitle = line?.status_title ?? t.statusTitle;
  const statusSub = line?.status_sub ?? t.statusSub;
  const forwardingStatus = line ? `Status: ${line.call_forwarding_status}` : t.callForwardingStatus;

  return (
    <View style={{ flex: 1, backgroundColor: surface }}>
      <LinearGradient
        colors={headerGradient}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={{ paddingTop: Math.max(insets.top, 14), paddingBottom: SHEET_RADIUS + 3 }}>
        <View style={{ paddingHorizontal: layout.gutter }}>
          <NavHeader title="Line settings" subtitle={null} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.body}
        contentContainerStyle={{ paddingHorizontal: layout.gutter, paddingTop: 32, paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}>
        <Tap
          pressScale={0.99}
          haptic={false}
          accessibilityRole="button"
          accessibilityLabel={statusTitle}
          onPress={() => router.push('/sim/line-status')}
          style={styles.linkRow}>
          <View style={{ flex: 1 }}>
            <AppText style={styles.title}>{statusTitle}</AppText>
            <AppText variant="small" tone="secondary" style={styles.sub}>
              {statusSub}
            </AppText>
          </View>
          <CaretRight size={18} color={colors.textTertiary} />
        </Tap>

        <View style={{ marginTop: 25 }}>
          <View style={styles.toggleRow}>
            <AppText style={styles.title}>{t.mobileInternet}</AppText>
            <Toggle value={internet} onChange={setInternet} accessibilityLabel={t.mobileInternet} />
          </View>
          <Tap
            hitSlop={8}
            haptic={false}
            accessibilityRole="link"
            onPress={() => requestInternetSettings().catch((e: unknown) => toast(errorMessage(e)))}
            style={{ alignSelf: 'flex-start', marginTop: 6 }}>
            <AppText variant="small" style={{ color: colors.accent }}>
              {line?.texts.internet_settings_link ?? t.internetSettingsLink}
            </AppText>
          </Tap>
        </View>

        <View style={{ marginTop: 25 }}>
          <View style={styles.toggleRow}>
            <AppText style={styles.title}>{t.secondLine}</AppText>
            <Toggle value={secondLine} onChange={setSecondLine} accessibilityLabel={t.secondLine} />
          </View>
          <AppText variant="small" tone="secondary" style={{ marginTop: 6 }}>
            {line?.texts.second_line_sub ?? t.secondLineSub}
          </AppText>
        </View>

        <Tap
          pressScale={0.99}
          haptic={false}
          accessibilityRole="button"
          accessibilityLabel={t.callForwarding}
          onPress={() => router.push('/sim/call-forwarding')}
          style={[styles.linkRow, { marginTop: 30 }]}>
          <View style={{ flex: 1 }}>
            <AppText style={styles.title}>{t.callForwarding}</AppText>
            <AppText variant="small" tone="secondary" style={styles.sub}>
              {forwardingStatus}
            </AppText>
          </View>
          <CaretRight size={18} color={colors.textTertiary} />
        </Tap>

        <View style={{ marginTop: 34 }}>
          <HelpCard color={colors.cardRaised} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, marginTop: -SHEET_RADIUS, borderTopLeftRadius: SHEET_RADIUS, borderTopRightRadius: SHEET_RADIUS, backgroundColor: surface },
  title: { fontSize: 15 },
  sub: { marginTop: 9 },
  linkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
});
