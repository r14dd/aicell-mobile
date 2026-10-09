import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { CaretLeft } from '@/components/icons';
import { AppText } from '@/components/ui/AppText';
import { Tap } from '@/components/ui/Tap';
import { useSession } from '@/state/session';
import { colors } from '@/theme/tokens';

type Props = { title?: string; subtitle?: string | null; right?: ReactNode };

/** Detail-screen header: back chevron, centered "My number / 051 664 33 42". */
export function NavHeader({ title = 'My number', subtitle, right }: Props) {
  const router = useRouter();
  const { account } = useSession();
  const line = subtitle === undefined ? account.number : subtitle;
  return (
    <View style={styles.row}>
      <Tap
        hitSlop={12}
        haptic={false}
        accessibilityRole="button"
        accessibilityLabel="Back"
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        style={styles.side}>
        <CaretLeft size={26} color={colors.text} weight="regular" />
      </Tap>
      <View style={styles.center}>
        <AppText variant="bodyMedium" style={{ fontSize: 17 }}>
          {title}
        </AppText>
        {line ? (
          <AppText variant="caption" tone="secondary">
            {line}
          </AppText>
        ) : null}
      </View>
      <View style={[styles.side, { alignItems: 'flex-end' }]}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', height: 64, marginHorizontal: -4 },
  side: { width: 44, justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', gap: 2 },
});
