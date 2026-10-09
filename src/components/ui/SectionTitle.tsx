import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Tap } from '@/components/ui/Tap';

type Props = {
  title: string;
  action?: string;
  onAction?: () => void;
  trailing?: ReactNode;
  first?: boolean;
};

export function SectionTitle({ title, action, onAction, trailing, first }: Props) {
  return (
    <View style={[styles.row, first && { marginTop: 0 }]}>
      <View style={styles.left}>
        <AppText variant="heading">{title}</AppText>
        {trailing}
      </View>
      {action ? (
        <Tap onPress={onAction} haptic={false} hitSlop={10} accessibilityRole="link">
          <AppText variant="bodyMedium" tone="link">
            {action}
          </AppText>
        </Tap>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 28,
    marginBottom: 14,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});
