import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { errorMessage } from '@/api/client';
import { invalidate, useQuery } from '@/api/query';
import { deactivateService, getService, subscribeService, toServiceDetail } from '@/api/sim';
import { CollapsingScreen } from '@/components/CollapsingScreen';
import { HelpCard } from '@/components/HelpCard';
import { Check } from '@/components/icons';
import { useToast } from '@/components/Toast';
import { GradientPill } from '@/components/ui/GradientPill';
import { AppText, tabular } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Tap } from '@/components/ui/Tap';
import { tariffSurface } from '@/data/myTariff';
import { findService, type ServiceSection } from '@/data/simServices';
import { useAccount } from '@/state/account';
import { colors, layout } from '@/theme/tokens';

export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const { applyMoney } = useAccount();
  const remote = useQuery(id ? `sim/services/${id}/` : null, () => getService(String(id))).data;
  const service = remote ? toServiceDetail(remote) : findService(id);
  const [notify, setNotify] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const { action } = service;
    setBusy(true);
    try {
      if ('purchase' in action) {
        const option = service.sections.find((s) => s.kind === 'option');
        const res = await subscribeService(service.id, notify && option?.kind === 'option' && option.id ? [option.id] : []);
        applyMoney(res);
        invalidate('sim/services/');
        toast(action.purchase.success);
        router.back();
      } else {
        await deactivateService(service.id);
        invalidate('sim/services/');
        toast('Service deactivated');
      }
    } catch (e) {
      toast(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <CollapsingScreen
      title={service.name}
      subtitle={service.subtitle}
      backgroundColor={tariffSurface}
      titleStyle={{ marginTop: 16, marginBottom: 6 }}
      headerExtra={
        <View style={styles.headerExtra}>
          <GradientPill label={service.badge} style={{ marginTop: 12 }} />
        </View>
      }
      footer={<Button variant="gradient" size="lg" label={service.action.label} disabled={busy} onPress={() => void submit()} />}>
      <View style={styles.panel}>
        {service.sections.map((section, i) => (
          <Section
            key={section.title}
            section={section}
            marginTop={i === 0 ? 0 : service.sections[i - 1].kind === 'text' ? 38 : 24}
            notify={notify}
            onNotify={() => setNotify((v) => !v)}
          />
        ))}
        <View style={{ marginTop: 28 }}>
          <HelpCard color={colors.cardRaised} />
        </View>
        <View style={{ height: 24 }} />
      </View>
    </CollapsingScreen>
  );
}

function Section({ section, marginTop, notify, onNotify }: { section: ServiceSection; marginTop: number; notify: boolean; onNotify: () => void }) {
  return (
    <View style={{ marginTop }}>
      <AppText variant="caption" tone="secondary" style={{ fontSize: 14 }}>
        {section.title}
      </AppText>
      {section.kind === 'text' ? (
        <AppText variant="body" style={styles.text}>
          {section.text}
        </AppText>
      ) : null}
      {section.kind === 'rows' ? (
        <View style={{ marginTop: 6 }}>
          {section.rows.map((r) => (
            <View key={r.label} style={styles.row}>
              <AppText variant="body" style={styles.rowText}>
                {r.label}
              </AppText>
              <AppText variant="body" style={[styles.rowText, tabular]}>
                {r.value}
              </AppText>
            </View>
          ))}
        </View>
      ) : null}
      {section.kind === 'option' ? (
        <Tap onPress={onNotify} pressScale={0.99} accessibilityRole="checkbox" accessibilityState={{ checked: notify }} accessibilityLabel={section.name} style={{ marginTop: 14 }}>
          <Card color={colors.cardRaised} padded={false} style={styles.option}>
            <View style={[styles.box, notify && styles.boxOn]}>{notify ? <Check size={14} color={colors.text} weight="bold" /> : null}</View>
            <View style={{ flex: 1 }}>
              <View style={styles.optionHead}>
                <AppText variant="body" style={styles.rowText}>
                  {section.name}
                </AppText>
                <AppText variant="body" style={styles.rowText}>
                  {section.price}
                </AppText>
              </View>
              <AppText variant="small" tone="secondary" style={{ marginTop: 3 }}>
                {section.sub}
              </AppText>
            </View>
          </Card>
        </Tap>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  // 24pt below the pill keeps the gradient behind the panel's rounded corners.
  headerExtra: { marginBottom: 24 },
  // Full-bleed body panel that overlaps the header gradient so its rounded top shows the gradient.
  panel: {
    marginHorizontal: -layout.gutter,
    marginTop: -42,
    marginBottom: -24,
    paddingHorizontal: layout.gutter,
    paddingTop: 22,
    paddingBottom: 24,
    backgroundColor: tariffSurface,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  text: { fontSize: 16, lineHeight: 19, marginTop: 16 },
  row: { height: 38, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowText: { fontSize: 16 },
  option: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 16, borderRadius: 18 },
  optionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  box: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: colors.lineStrong, alignItems: 'center', justifyContent: 'center' },
  boxOn: { backgroundColor: colors.accent, borderColor: colors.accent },
});
