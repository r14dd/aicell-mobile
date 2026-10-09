import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useQuery } from '@/api/query';
import { getSim, longDay } from '@/api/sim';
import { CellSignalFull, ChatText, Check, Cpu, Gear, Info, Lightning, MagnifyingGlass, SimCard } from '@/components/icons';
import { NavHeader } from '@/components/NavHeader';
import { useToast } from '@/components/Toast';
import { AppText } from '@/components/ui/AppText';
import { ListRow } from '@/components/ui/ListRow';
import { Tap } from '@/components/ui/Tap';
import { surface } from '@/data/notifications';
import { noOutline } from '@/theme/inputs';
import { colors, font, headerGradient, layout, radius } from '@/theme/tokens';

const SHEET_RADIUS = 20;

const details = [
  { label: 'One-way blocking', value: '25 October 2026' },
  { label: 'Deactivation date', value: '23 January 2027' },
];

const settings: { label: string; Icon: typeof Gear; href?: '/esim' | '/sim/line' | '/sim/roaming' | '/sim/sms' | '/sim/puk' | '/sim/services' }[] = [
  { label: 'Line settings', Icon: Gear, href: '/sim/line' },
  { label: 'Roaming settings', Icon: CellSignalFull, href: '/sim/roaming' },
  { label: 'eSIM', Icon: Cpu, href: '/esim' },
  { label: 'SMS settings', Icon: ChatText, href: '/sim/sms' },
  { label: 'PUK codes', Icon: SimCard, href: '/sim/puk' },
  { label: 'Services', Icon: Lightning, href: '/sim/services' },
];

export default function SimSettingsScreen() {
  const router = useRouter();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const sim = useQuery('sim/', getSim).data;
  const detailRows = sim ? sim.details.map((d) => ({ label: d.label, value: longDay(d.value) })) : details;
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  const q = query.trim().toLowerCase();
  const rows = settings.filter((s) => !q || s.label.toLowerCase().includes(q));

  return (
    <View style={{ flex: 1, backgroundColor: surface }}>
      <LinearGradient
        colors={headerGradient}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={{ paddingTop: Math.max(insets.top, 14), paddingBottom: SHEET_RADIUS + 18 }}>
        <View style={{ paddingHorizontal: layout.gutter }}>
          <NavHeader title="SIM settings" subtitle="My number" />
        </View>

        <View style={styles.badgeSlot}>
          {loading ? (
            <View style={styles.skeleton} />
          ) : (
            <View style={styles.badge}>
              <Check size={14} color="#FFFFFF" weight="bold" />
              <AppText variant="small" style={{ fontFamily: font.bold, color: '#FFFFFF' }}>
                {sim?.badge ?? '4G (LTE) enabled'}
              </AppText>
            </View>
          )}
        </View>

        <View style={styles.glass}>
          {detailRows.map((d) => (
            <View key={d.label} style={styles.detail}>
              <View style={styles.detailLabel}>
                <AppText variant="caption" style={{ fontSize: 14 }}>
                  {d.label}
                </AppText>
                <Tap
                  hitSlop={10}
                  haptic={false}
                  accessibilityRole="button"
                  accessibilityLabel={`${d.label} details`}
                  onPress={() => toast(`${d.label} details are not part of this prototype yet`)}>
                  <Info size={16} color={colors.info} />
                </Tap>
              </View>
              <AppText variant="captionMedium" style={{ fontSize: 14 }}>
                {d.value}
              </AppText>
            </View>
          ))}
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.body}
        contentContainerStyle={{ paddingHorizontal: layout.gutter, paddingTop: 20, paddingBottom: insets.bottom + 32 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.search}>
          <MagnifyingGlass size={20} color={colors.textSecondary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search"
            placeholderTextColor={colors.textSecondary}
            selectionColor={colors.accent}
            returnKeyType="search"
            style={{ flex: 1, fontFamily: font.regular, fontSize: 17, color: colors.text, padding: 0, ...noOutline }}
          />
        </View>

        <View style={{ marginTop: 7 }}>
          {rows.map(({ label, Icon, href }) => (
            <View key={label} style={{ height: 66, justifyContent: 'center' }}>
              <ListRow
                icon={<Icon size={24} color={colors.accentIcon} weight="light" />}
                label={label}
                onPress={() => (href ? router.push(href) : toast(`${label} are not part of this prototype yet`))}
              />
            </View>
          ))}
        </View>

        {rows.length === 0 ? (
          <AppText variant="caption" style={{ fontSize: 14, textAlign: 'center', marginTop: 30 }}>
            No results
          </AppText>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  badgeSlot: { height: 24, marginTop: -2, alignItems: 'center', justifyContent: 'center' },
  skeleton: { width: 135, height: 24, borderRadius: radius.pill, backgroundColor: '#8C8C8C' },
  badge: {
    height: 24,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: '#4BB508',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  glass: { marginHorizontal: layout.gutter, marginTop: 14, borderRadius: 16, paddingVertical: 23, paddingHorizontal: 20, gap: 22, backgroundColor: colors.glass },
  detail: { height: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  detailLabel: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  body: { flex: 1, marginTop: -SHEET_RADIUS, borderTopLeftRadius: SHEET_RADIUS, borderTopRightRadius: SHEET_RADIUS, backgroundColor: surface },
  search: {
    height: 46,
    backgroundColor: colors.cardRaised,
    borderRadius: 23,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});
