import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DatePicker, formatRange, inRange, parseDate, type DateRange } from '@/components/DatePicker';
import { CalendarBlank, DeviceMobile, X } from '@/components/icons';
import { NavHeader } from '@/components/NavHeader';
import { AppText, tabular } from '@/components/ui/AppText';
import { Tap } from '@/components/ui/Tap';
import { getTopUps, toTopUp } from '@/api/billing';
import { useQuery } from '@/api/query';
import { money } from '@/data/mock';
import { surface } from '@/data/notifications';
import { topUps, type TopUp } from '@/data/topUps';
import { colors, headerGradient, layout, radius } from '@/theme/tokens';

const SHEET_RADIUS = 20;
const pad = (n: number) => String(n).padStart(2, '0');

const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export default function TopUpsScreen() {
  const insets = useSafeAreaInsets();
  const [date, setDate] = useState<DateRange | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerKey, setPickerKey] = useState(0);

  const range = date ? { from: iso(date.start), to: iso(date.end ?? date.start) } : undefined;
  const feed = useQuery(`billing/top-ups/?from=${range?.from ?? ''}&to=${range?.to ?? ''}`, () => getTopUps(range)).data;
  const groups = useMemo(() => {
    const rows = feed
      ? feed.results.map(toTopUp)
      : date
        ? topUps.filter((r) => {
            const d = parseDate(r.date);
            return !!d && inRange(d, date);
          })
        : topUps;
    const out: { label: string; items: TopUp[] }[] = [];
    for (const r of rows) {
      const label = r.date.replace(/ \d{4}$/, '');
      const last = out[out.length - 1];
      if (last?.label === label) last.items.push(r);
      else out.push({ label, items: [r] });
    }
    return out;
  }, [feed, date]);

  return (
    <>
      <View style={{ flex: 1, backgroundColor: surface }}>
        <LinearGradient
          colors={headerGradient}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={{ paddingTop: Math.max(insets.top, 14), paddingHorizontal: layout.gutter, paddingBottom: SHEET_RADIUS + 2 }}>
          <NavHeader
            title="Top-ups"
            subtitle={null}
            right={
              <Tap
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel="Filter by date"
                onPress={() => {
                  setPickerKey((k) => k + 1);
                  setPickerOpen(true);
                }}>
                <CalendarBlank size={22} color={colors.text} />
              </Tap>
            }
          />
        </LinearGradient>

        <ScrollView
          style={styles.body}
          contentContainerStyle={{ paddingHorizontal: layout.gutter, paddingBottom: insets.bottom + 32 }}
          showsVerticalScrollIndicator={false}>
          {date ? (
            <View style={{ marginTop: 16, marginLeft: -8, flexDirection: 'row' }}>
              <Tap
                accessibilityRole="button"
                accessibilityLabel={`Clear date filter ${formatRange(date)}`}
                onPress={() => setDate(null)}
                style={styles.chip}>
                <AppText variant="caption" style={{ fontSize: 14 }}>
                  {formatRange(date, !!date.end)}
                </AppText>
                <X size={14} color={colors.text} weight="regular" />
              </Tap>
            </View>
          ) : null}

          {groups.map((group, gi) => (
            <View key={group.label}>
              <AppText variant="caption" tone="secondary" style={{ fontSize: 14, marginTop: gi === 0 ? 18 : 28, marginBottom: 7 }}>
                {group.label}
              </AppText>
              <View style={{ gap: 22 }}>
                {group.items.map((item) => (
                  <View key={item.id} style={styles.row}>
                    <View style={styles.circle}>
                      <DeviceMobile size={24} color={iconColor} weight="light" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <AppText variant="body" style={{ fontSize: 16 }}>
                        Number balance
                      </AppText>
                      <AppText variant="caption" tone="secondary" style={{ marginTop: 2 }}>
                        {item.time}
                      </AppText>
                    </View>
                    <AppText variant="body" tone="green" style={tabular}>
                      {`+${money(item.amount)} ₼`}
                    </AppText>
                  </View>
                ))}
              </View>
            </View>
          ))}

          {groups.length === 0 ? (
            <AppText variant="caption" style={{ fontSize: 14, textAlign: 'center', marginTop: 30 }}>
              No results
            </AppText>
          ) : null}
        </ScrollView>
      </View>

      <DatePicker
        key={pickerKey}
        visible={pickerOpen}
        value={date}
        onClose={() => setPickerOpen(false)}
        onApply={(d) => {
          setDate(d);
          setPickerOpen(false);
        }}
      />
    </>
  );
}

/** Indigo phone glyph on the pale lavender disc, sampled from the recording. */
const iconColor = '#6558D0';

const styles = StyleSheet.create({
  body: { flex: 1, marginTop: -SHEET_RADIUS, borderTopLeftRadius: SHEET_RADIUS, borderTopRightRadius: SHEET_RADIUS, backgroundColor: surface },
  chip: {
    height: 34,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 48 },
  circle: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#E0DDFD', alignItems: 'center', justifyContent: 'center' },
});
