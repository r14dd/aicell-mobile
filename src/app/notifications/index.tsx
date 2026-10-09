import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, TextInput, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DatePicker, formatRange, inRange, parseDate, type DateRange } from '@/components/DatePicker';
import { GradientScreen } from '@/components/GradientScreen';
import { CalendarBlank, CaretLeft, CaretRight, DotsThreeVertical, MagnifyingGlass, X } from '@/components/icons';
import { useToast } from '@/components/Toast';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Tap } from '@/components/ui/Tap';
import { img } from '@/data/assets';
import { getNotifications, toNotification } from '@/api/content';
import { useQuery } from '@/api/query';
import { groupByDate, notifications, surface } from '@/data/notifications';
import { noOutline } from '@/theme/inputs';
import { colors, font, radius } from '@/theme/tokens';

const GUTTER = 20;

function Bar({ style }: { style: object }) {
  return <View style={[{ backgroundColor: colors.cardRaised }, style]} />;
}

/** Loading placeholder: filter row, then two groups of a date label and three rows. */
function Skeleton() {
  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 }}>
        <Bar style={{ width: 40, height: 40, borderRadius: 20 }} />
        <Bar style={{ flex: 1, height: 40, borderRadius: 20 }} />
      </View>
      {[0, 1].map((g) => (
        <View key={g} style={{ marginTop: 20, paddingHorizontal: 5 }}>
          <Bar style={{ width: 48, height: 19, borderRadius: 10 }} />
          <View style={{ marginTop: 20, gap: 10 }}>
            {[0, 1, 2].map((r) => (
              <Bar key={r} style={{ height: 78, borderRadius: 16 }} />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

export default function NotificationsScreen() {
  const router = useRouter();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [date, setDate] = useState<DateRange | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerKey, setPickerKey] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  // The server filters; while a new filter loads, the previous answer stays on screen.
  const [search, setSearch] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setSearch(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);
  const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const filter = { q: search || undefined, from: date ? iso(date.start) : undefined, to: date ? iso(date.end ?? date.start) : undefined };
  const key = `content/notifications/?q=${filter.q ?? ''}&from=${filter.from ?? ''}&to=${filter.to ?? ''}`;
  const feed = useQuery(key, () => getNotifications(filter)).data;
  const items = useMemo(() => {
    if (feed) return feed.results.map(toNotification);
    const q = search.toLowerCase();
    const inSelection = (text: string) => {
      if (!date) return true;
      const d = parseDate(text);
      return !!d && inRange(d, date);
    };
    return notifications.filter((n) => inSelection(n.date) && (!q || n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q)));
  }, [feed, search, date]);
  const groups = groupByDate(items);

  const clearAll = () => {
    setQuery('');
    setDate(null);
  };

  return (
    <>
      <GradientScreen
        withTabBar={false}
        // The sheet starts at top + 62 (header row 52 + 4 below it + 6 padding) and fills the rest of the screen.
        sheetStyle={{ backgroundColor: surface, paddingTop: 14, paddingHorizontal: GUTTER, minHeight: height - Math.max(insets.top, 14) - 62 }}
        header={
          <View style={{ height: 52, marginBottom: -20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 24, paddingRight: 22 }}>
            <View pointerEvents="none" style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
              <AppText variant="bodyMedium" style={{ fontSize: 17 }}>
                Notifications
              </AppText>
            </View>
            <Tap
              hitSlop={12}
              haptic={false}
              accessibilityRole="button"
              accessibilityLabel="Back"
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}>
              <CaretLeft size={24} color={colors.text} />
            </Tap>
            <Tap
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="More options"
              onPress={() => toast('Notification options are not part of this prototype yet')}
              style={{ width: 44, alignItems: 'center' }}>
              <DotsThreeVertical size={22} color={colors.text} weight="bold" />
            </Tap>
          </View>
        }>
        {loading ? (
          <Skeleton />
        ) : (
          <Animated.View entering={FadeIn.duration(200)}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Tap
                accessibilityRole="button"
                accessibilityLabel="Filter by date"
                onPress={() => {
                  setPickerKey((k) => k + 1);
                  setPickerOpen(true);
                }}
                style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.cardRaised, alignItems: 'center', justifyContent: 'center' }}>
                <CalendarBlank size={20} color={colors.text} />
              </Tap>
              <View
                style={{
                  flex: 1,
                  height: 44,
                  backgroundColor: colors.cardRaised,
                  borderRadius: 22,
                  paddingHorizontal: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                }}>
                <MagnifyingGlass size={20} color={colors.textSecondary} />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Search"
                  placeholderTextColor={colors.textTertiary}
                  selectionColor={colors.accent}
                  returnKeyType="search"
                  style={{ flex: 1, fontFamily: font.regular, fontSize: 17, color: colors.text, padding: 0, ...noOutline }}
                />
              </View>
            </View>

            {date ? (
              <View style={{ marginTop: 12, flexDirection: 'row' }}>
                <Tap
                  accessibilityRole="button"
                  accessibilityLabel={`Clear date filter ${formatRange(date)}`}
                  onPress={() => setDate(null)}
                  style={{
                    backgroundColor: colors.cardRaised,
                    borderRadius: radius.pill,
                    paddingHorizontal: 12,
                    height: 30,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                  }}>
                  <AppText variant="small" style={{ fontSize: 12 }}>
                    {formatRange(date, !!date.end)}
                  </AppText>
                  <X size={12} color={colors.text} weight="bold" />
                </Tap>
              </View>
            ) : null}

            {groups.map((group, gi) => (
              <View key={group.date}>
                <AppText variant="caption" tone="secondary" style={{ fontSize: 14, marginTop: gi === 0 ? 20 : 22, marginBottom: 10 }}>
                  {group.date}
                </AppText>
                <View style={{ gap: 10 }}>
                  {group.items.map((item) => (
                    <Tap
                      key={item.id}
                      accessibilityRole="button"
                      accessibilityLabel={item.title}
                      onPress={() => router.push({ pathname: '/notifications/[id]', params: { id: item.id } })}>
                      <View
                        style={{
                          borderWidth: 1,
                          borderColor: colors.lineStrong,
                          borderRadius: radius.lg,
                          paddingVertical: 18,
                          paddingHorizontal: 16,
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 10,
                        }}>
                        <Image source={img.avatarMark} style={{ width: 52, height: 52, borderRadius: 26 }} contentFit="cover" />
                        <View style={{ flex: 1 }}>
                          <AppText variant="bodyMedium" numberOfLines={2} style={{ fontSize: 15, lineHeight: 19 }}>
                            {item.title}
                          </AppText>
                          <AppText variant="small" tone="secondary" numberOfLines={2} ellipsizeMode="tail" style={{ fontSize: 13, lineHeight: 16, marginTop: 3 }}>
                            {item.body}
                          </AppText>
                        </View>
                        <CaretRight size={16} color={colors.textTertiary} />
                      </View>
                    </Tap>
                  ))}
                </View>
              </View>
            ))}

            {items.length === 0 ? (
              <View style={{ marginTop: 48, alignItems: 'center', gap: 14 }}>
                <AppText variant="caption" tone="secondary" style={{ fontSize: 14 }}>
                  No results
                </AppText>
                <Button label="Clear search" size="sm" onPress={clearAll} />
              </View>
            ) : null}
          </Animated.View>
        )}
      </GradientScreen>

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
