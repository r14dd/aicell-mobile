import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Tap } from '@/components/ui/Tap';
import { colors, radius } from '@/theme/tokens';

export type QuickAction = { key: string; label: string; icon: ReactNode; onPress?: () => void };

/** Translucent bar of three shortcuts under the header (SimKredit, Buy internet, SIM settings). */
export function QuickActionBar({ actions }: { actions: QuickAction[] }) {
  return (
    <View style={styles.bar}>
      {actions.map((a) => (
        <Tap key={a.key} onPress={a.onPress} accessibilityRole="button" accessibilityLabel={a.label} style={styles.item}>
          {a.icon}
          <AppText variant="small" style={{ fontSize: 13 }}>
            {a.label}
          </AppText>
        </Tap>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', backgroundColor: colors.glass, borderRadius: radius.md, paddingVertical: 11 },
  item: { flex: 1, alignItems: 'center', gap: 8 },
});
