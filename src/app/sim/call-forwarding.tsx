import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { errorMessage } from '@/api/client';
import { setQueryData, useQuery } from '@/api/query';
import { getForwarding, patchForwarding } from '@/api/sim';
import { Info } from '@/components/icons';
import { NavHeader } from '@/components/NavHeader';
import { useToast } from '@/components/Toast';
import { AppText } from '@/components/ui/AppText';
import { Tap } from '@/components/ui/Tap';
import { Toggle } from '@/components/ui/Toggle';
import { surface } from '@/data/notifications';
import { forwardingRows, type ForwardingKey } from '@/data/simSettings';
import { colors, headerGradient, layout } from '@/theme/tokens';

const SHEET_RADIUS = 20;

type State = Record<ForwardingKey, boolean>;

const allOff: State = { all: false, unanswered: false, busy: false, unreachable: false };

export default function CallForwardingScreen() {
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const remote = useQuery('sim/call-forwarding/', getForwarding).data;
  const [pending, setPending] = useState<State | null>(null);
  const state: State = pending ?? remote ?? allOff;

  // "All calls" overrides the conditional rules: switching it on clears them and locks them; the server applies the same rule.
  const change = (key: ForwardingKey, next: boolean) => {
    setPending(key === 'all' ? { ...allOff, all: next } : { ...state, [key]: next });
    patchForwarding({ [key]: next })
      .then((res) => setQueryData('sim/call-forwarding/', res))
      .catch((e: unknown) => toast(errorMessage(e)))
      .finally(() => setPending(null));
  };

  const [all, ...conditional] = forwardingRows;

  return (
    <View style={{ flex: 1, backgroundColor: surface }}>
      <LinearGradient
        colors={headerGradient}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={{ paddingTop: Math.max(insets.top, 14), paddingBottom: SHEET_RADIUS + 11 }}>
        <View style={{ paddingHorizontal: layout.gutter }}>
          <NavHeader
            title="Call forwarding"
            subtitle={null}
            right={
              <Tap
                hitSlop={8}
                haptic={false}
                accessibilityRole="button"
                accessibilityLabel="Call forwarding help"
                onPress={() => toast('Call forwarding help is not part of this prototype yet')}
                style={{ width: 44, alignItems: 'center' }}>
                <Info size={22} color={colors.text} />
              </Tap>
            }
          />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.body}
        contentContainerStyle={{ paddingHorizontal: layout.gutter, paddingTop: 33, paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}>
        <View style={styles.row}>
          <AppText style={styles.label}>{all.label}</AppText>
          <Toggle value={state.all} onChange={(next) => change('all', next)} accessibilityLabel={all.label} />
        </View>

        <View style={styles.or}>
          <View style={styles.orLine} />
          <AppText variant="label" tone="onHeaderSecondary">
            OR
          </AppText>
          <View style={styles.orLine} />
        </View>

        {conditional.map((r) => (
          <View key={r.key} style={[styles.row, state.all && { opacity: 0.45 }]}>
            <AppText style={styles.label}>{r.label}</AppText>
            <Toggle value={state[r.key]} onChange={(next) => change(r.key, next)} accessibilityLabel={r.label} disabled={state.all} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, marginTop: -SHEET_RADIUS, borderTopLeftRadius: SHEET_RADIUS, borderTopRightRadius: SHEET_RADIUS, backgroundColor: surface },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 43, paddingVertical: 8 },
  label: { flex: 1, fontSize: 15, lineHeight: 19 },
  or: { flexDirection: 'row', alignItems: 'center', gap: 6, marginVertical: 14 },
  orLine: { flex: 1, height: 1, backgroundColor: colors.lineStrong },
});
