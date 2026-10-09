import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useRef, useState } from 'react';
import { Modal, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { X } from '@/components/icons';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { Tap } from '@/components/ui/Tap';
import { surface } from '@/data/notifications';
import { colors, ctaGradient, font, layout } from '@/theme/tokens';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['Mon.', 'Tue.', 'Wed.', 'Thu.', 'Fri.', 'Sat.', 'Sun.'];
const MONTHS_BACK = 12;
const CELL = 50;
const CIRCLE = 42;
const bandColor = 'rgba(123,65,232,0.28)';

/** A single day (end null) or an inclusive range. */
export type DateRange = { start: Date; end: Date | null };

/** `01 September 2026` (padded) or `1 September 2026`. */
export function formatDate(d: Date, pad = true) {
  const day = pad ? String(d.getDate()).padStart(2, '0') : String(d.getDate());
  return `${day} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** `01 Sep 2026`, for chips where a range must fit on one line. */
export function formatShort(d: Date) {
  return `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`;
}

/** Footer and chip label for a selection. */
export function formatRange(r: DateRange, short = false) {
  const f = short ? formatShort : formatDate;
  return r.end ? `${f(r.start)} - ${f(r.end)}` : formatDate(r.start);
}

/** Parses the app's `27 October 2025` date strings; null when the text is not a date. */
export function parseDate(text: string): Date | null {
  const m = text.trim().match(/^(\d{1,2}) ([A-Za-z]+) (\d{4})$/);
  if (!m) return null;
  const month = MONTHS.findIndex((name) => name.toLowerCase() === m[2].toLowerCase());
  if (month < 0) return null;
  return new Date(Number(m[3]), month, Number(m[1]));
}

const dayKey = (d: Date) => d.getFullYear() * 10000 + d.getMonth() * 100 + d.getDate();
const sameDay = (a: Date, b: Date) => dayKey(a) === dayKey(b);

/** True when `d` falls inside the selection (inclusive). */
export function inRange(d: Date, r: DateRange) {
  const k = dayKey(d);
  const end = r.end ?? r.start;
  return k >= dayKey(r.start) && k <= dayKey(end);
}

type Props = {
  visible: boolean;
  value: DateRange | null;
  onClose: () => void;
  onApply: (r: DateRange | null) => void;
};

/**
 * Full-screen date picker: one scrolling list of month grids (Monday first), today last.
 * One tap picks a day, a second tap on a later day closes a range, a tap before the start
 * restarts from that day, and a tap after a closed range starts a new selection.
 */
export function DatePicker({ visible, value, onClose, onApply }: Props) {
  const insets = useSafeAreaInsets();
  // The list remounts this picker on every open (see the `key` there), so the draft starts from `value`.
  const [selected, setSelected] = useState<DateRange | null>(value);
  const scroll = useRef<ScrollView>(null);

  const pick = (date: Date) => {
    setSelected((cur) => {
      if (!cur || cur.end) return { start: date, end: null };
      if (sameDay(date, cur.start)) return cur;
      if (dayKey(date) < dayKey(cur.start)) return { start: date, end: null };
      return { start: cur.start, end: date };
    });
  };

  const { today, months } = useMemo(() => {
    const now = new Date();
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const list = Array.from({ length: MONTHS_BACK + 1 }, (_, i) => {
      const first = new Date(day.getFullYear(), day.getMonth() - MONTHS_BACK + i, 1);
      const lead = (first.getDay() + 6) % 7;
      const count = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
      const cells: (number | null)[] = [...Array<null>(lead).fill(null), ...Array.from({ length: count }, (_, k) => k + 1)];
      while (cells.length % 7) cells.push(null);
      const weeks = Array.from({ length: cells.length / 7 }, (_, w) => cells.slice(w * 7, w * 7 + 7));
      return { year: first.getFullYear(), month: first.getMonth(), weeks };
    });
    return { today: day, months: list };
  }, []);

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: surface, alignItems: 'center' }}>
        <View style={{ flex: 1, width: '100%', maxWidth: layout.maxWidth, paddingTop: Math.max(insets.top, 14) }}>
          <View style={{ height: 56, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <AppText variant="bodyMedium" style={{ fontSize: 17 }}>
              Select date
            </AppText>
            <Tap hitSlop={12} haptic={false} accessibilityRole="button" accessibilityLabel="Close" onPress={onClose}>
              <X size={24} color={colors.text} />
            </Tap>
          </View>
          <Divider style={{ backgroundColor: colors.lineStrong }} />
          <View style={{ height: 48, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' }}>
            {WEEKDAYS.map((w) => (
              <AppText key={w} variant="captionMedium" tone="secondary" style={{ flex: 1, textAlign: 'center', fontFamily: font.semibold, fontSize: 15 }}>
                {w}
              </AppText>
            ))}
          </View>
          <Divider style={{ backgroundColor: colors.lineStrong }} />

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: 14 }}
            showsVerticalScrollIndicator={false}
            ref={scroll}
            onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: false })}>
            {months.map((m) => (
              <View key={`${m.year}-${m.month}`}>
                <AppText variant="bodySemibold" style={{ fontSize: 17, marginTop: 12, marginBottom: 12, marginLeft: 6 }}>
                  {`${MONTHS[m.month]} ${m.year}`}
                </AppText>
                {m.weeks.map((week, w) => (
                  <View key={w} style={{ flexDirection: 'row' }}>
                    {week.map((day, c) => {
                      if (day === null) return <View key={c} style={{ flex: 1, height: CELL }} />;
                      const date = new Date(m.year, m.month, day);
                      const future = date > today;
                      const isStart = !!selected && sameDay(date, selected.start);
                      const isEnd = !!selected?.end && sameDay(date, selected.end);
                      const between = !!selected?.end && inRange(date, selected) && !isStart && !isEnd;
                      const isToday = sameDay(date, today);
                      const hasBand = !!selected?.end && inRange(date, selected);
                      return (
                        <Tap
                          key={c}
                          disabled={future}
                          haptic={false}
                          accessibilityRole="button"
                          accessibilityLabel={formatDate(date)}
                          accessibilityState={{ selected: isStart || isEnd || between }}
                          onPress={() => pick(date)}
                          style={{ flex: 1, height: CELL, alignItems: 'center', justifyContent: 'center' }}>
                          {hasBand ? (
                            <View
                              pointerEvents="none"
                              style={{
                                position: 'absolute',
                                top: (CELL - CIRCLE) / 2,
                                height: CIRCLE,
                                left: isStart ? '50%' : 0,
                                right: isEnd ? '50%' : 0,
                                backgroundColor: bandColor,
                              }}
                            />
                          ) : null}
                          <View
                            style={{
                              width: CIRCLE,
                              height: CIRCLE,
                              borderRadius: CIRCLE / 2,
                              overflow: 'hidden',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: isToday && !isStart && !isEnd ? colors.lineStrong : 'transparent',
                            }}>
                            {isStart || isEnd ? (
                              <LinearGradient colors={ctaGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
                            ) : null}
                            <AppText variant="body" style={{ fontSize: 16, color: future ? colors.textTertiary : colors.text }}>
                              {day}
                            </AppText>
                          </View>
                        </Tap>
                      );
                    })}
                  </View>
                ))}
              </View>
            ))}
          </ScrollView>

          {selected ? (
            <View>
              <Divider style={{ backgroundColor: colors.lineStrong }} />
              <AppText variant="caption" style={{ fontSize: 13, textAlign: 'center', marginTop: 20 }}>
                {formatRange(selected)}
              </AppText>
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 20, paddingHorizontal: 20, paddingBottom: insets.bottom + 16 }}>
                <Button label="Clear" variant="outline" size="lg" style={{ flex: 1 }} onPress={() => setSelected(null)} />
                <Button label="Show" variant="gradient" size="lg" style={{ flex: 1.6 }} onPress={() => onApply(selected)} />
              </View>
            </View>
          ) : (
            <View style={{ height: insets.bottom }} />
          )}
        </View>
      </View>
    </Modal>
  );
}
