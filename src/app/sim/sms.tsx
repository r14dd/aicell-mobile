import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { errorMessage } from '@/api/client';
import { setQueryData, useQuery } from '@/api/query';
import { getSms, patchSms } from '@/api/sim';
import { HelpCard } from '@/components/HelpCard';
import { CaretRight, Info } from '@/components/icons';
import { NavHeader } from '@/components/NavHeader';
import { Sheet } from '@/components/Sheet';
import { useToast } from '@/components/Toast';
import { AzFlag, RuFlag, UkFlag } from '@/components/ui/Flag';
import { AppText } from '@/components/ui/AppText';
import { Divider } from '@/components/ui/Divider';
import { Tap } from '@/components/ui/Tap';
import { Toggle } from '@/components/ui/Toggle';
import { surface } from '@/data/notifications';
import { smsCopy, smsLanguages, smsToggles, type SmsLanguageId, type SmsToggleId } from '@/data/simServices';
import { colors, headerGradient, layout } from '@/theme/tokens';

const SHEET_RADIUS = 20;
const FLAG = 26;


export default function SmsSettingsScreen() {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const sms = useQuery('sim/sms/', getSms).data;
  const [sheetOpen, setSheetOpen] = useState(false);
  // Switches and the language flip at once; the server's answer then replaces the cached settings.
  const [pendingLanguage, setPendingLanguage] = useState<SmsLanguageId | null>(null);
  const [pendingOn, setPendingOn] = useState<Partial<Record<SmsToggleId, boolean>>>({});
  const language: SmsLanguageId = pendingLanguage ?? sms?.language ?? 'az';
  const on: Record<SmsToggleId, boolean> = { ads: true, campaigns: true, partners: true, ...sms?.toggles, ...pendingOn };
  const save = (body: { language?: SmsLanguageId; toggles?: Partial<Record<SmsToggleId, boolean>> }) =>
    patchSms(body)
      .then((res) => setQueryData('sim/sms/', res))
      .catch((e: unknown) => toast(errorMessage(e)))
      .finally(() => {
        setPendingLanguage(null);
        setPendingOn({});
      });
  const setLanguage = (id: SmsLanguageId) => {
    setPendingLanguage(id);
    void save({ language: id });
  };
  const setToggle = (id: SmsToggleId, v: boolean) => {
    setPendingOn((p) => ({ ...p, [id]: v }));
    void save({ toggles: { [id]: v } });
  };
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const pick = (id: SmsLanguageId) => {
    setLanguage(id);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setSheetOpen(false), 250);
  };

  const languageName = smsLanguages.find((l) => l.id === language)?.name ?? '';
  const azercell = smsToggles.filter((t) => t.group === 'azercell');
  const partners = smsToggles.filter((t) => t.group === 'partners');
  const toggleRow = (t: (typeof smsToggles)[number], marginTop: number) => (
    <ToggleRow key={t.id} label={t.label} sub={t.sub} value={on[t.id]} onChange={(v) => setToggle(t.id, v)} marginTop={marginTop} />
  );

  return (
    <>
      <View style={{ flex: 1, backgroundColor: surface }}>
        <LinearGradient
          colors={headerGradient}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={{ paddingTop: Math.max(insets.top, 14), paddingBottom: SHEET_RADIUS }}>
          <View style={{ paddingHorizontal: layout.gutter }}>
            <NavHeader title={smsCopy.title} subtitle={null} />
          </View>
        </LinearGradient>

        <ScrollView
          style={styles.body}
          contentContainerStyle={{ paddingHorizontal: layout.gutter, paddingTop: 24, paddingBottom: insets.bottom + 32 }}
          showsVerticalScrollIndicator={false}>
          <AppText variant="caption" tone="secondary" style={styles.section}>
            {smsCopy.fromAzercell}
          </AppText>

          <Tap
            onPress={() => setSheetOpen(true)}
            pressScale={0.99}
            haptic={false}
            accessibilityRole="button"
            accessibilityLabel={`${smsCopy.languageLabel}, ${languageName}`}
            style={styles.languageRow}>
            <AppText variant="body" style={styles.label}>
              {smsCopy.languageLabel}
            </AppText>
            <Info size={14} color={colors.info} />
            <View style={{ flex: 1 }} />
            <AppText variant="caption" style={{ fontSize: 14 }}>
              {languageName}
            </AppText>
            <CaretRight size={16} color={colors.textTertiary} />
          </Tap>

          {azercell.map((t, i) => toggleRow(t, i === 0 ? 12 : 20))}

          <Divider style={{ marginTop: 26 }} />
          <AppText variant="caption" tone="secondary" style={[styles.section, { marginTop: 24 }]}>
            {smsCopy.fromPartners}
          </AppText>
          {partners.map((t) => toggleRow(t, 16))}

          <View style={{ marginTop: 32 }}>
            <HelpCard color={colors.cardRaised} />
          </View>
        </ScrollView>
      </View>

      <Sheet visible={sheetOpen} onClose={() => setSheetOpen(false)} title={smsCopy.sheetTitle}>
        {smsLanguages.map((l) => {
          const selected = l.id === language;
          return (
            <Tap
              key={l.id}
              onPress={() => pick(l.id)}
              pressScale={0.99}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              style={styles.langRow}>
              <Flag id={l.id} />
              <AppText variant="body" style={[styles.label, { flex: 1 }]}>
                {l.name}
              </AppText>
              <View style={[styles.radio, selected && styles.radioOn]} />
            </Tap>
          );
        })}
      </Sheet>
    </>
  );
}

function ToggleRow({ label, sub, value, onChange, marginTop }: { label: string; sub: string; value: boolean; onChange: (next: boolean) => void; marginTop: number }) {
  return (
    <View style={{ marginTop }}>
      <View style={styles.toggleHead}>
        <AppText variant="body" style={[styles.label, { flex: 1 }]}>
          {label}
        </AppText>
        <Toggle value={value} onChange={onChange} accessibilityLabel={label} />
      </View>
      <AppText variant="small" tone="secondary" style={{ marginTop: 6, fontSize: 13 }}>
        {sub}
      </AppText>
    </View>
  );
}

function Flag({ id }: { id: SmsLanguageId }) {
  if (id === 'en') return <UkFlag size={FLAG} />;
  if (id === 'ru') return <RuFlag size={FLAG} />;
  return <AzFlag size={FLAG} />;
}

const styles = StyleSheet.create({
  body: { flex: 1, marginTop: -SHEET_RADIUS, borderTopLeftRadius: SHEET_RADIUS, borderTopRightRadius: SHEET_RADIUS, backgroundColor: surface },
  section: { fontSize: 14 },
  label: { fontSize: 16 },
  languageRow: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44, marginTop: 8 },
  toggleHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  langRow: { flexDirection: 'row', alignItems: 'center', gap: 14, height: 50 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.lineStrong },
  radioOn: { borderWidth: 6, borderColor: colors.accentIcon },
});
