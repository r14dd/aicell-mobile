import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { CaretRight } from '@/components/icons';
import { AppText } from '@/components/ui/AppText';
import { Tap } from '@/components/ui/Tap';
import { colors } from '@/theme/tokens';

type Props = {
  icon?: ReactNode;
  label: string;
  sublabel?: string;
  right?: ReactNode;
  chevron?: boolean;
  onPress?: () => void;
  tone?: 'primary' | 'red';
};

/** Settings-style row: icon, label, trailing chevron. */
export function ListRow({ icon, label, sublabel, right, chevron = true, onPress, tone = 'primary' }: Props) {
  return (
    <Tap onPress={onPress} pressScale={0.99} haptic={false} style={styles.row} accessibilityRole="button">
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <View style={styles.text}>
        <AppText variant="body" tone={tone === 'red' ? 'red' : 'primary'} style={{ fontSize: 17 }}>
          {label}
        </AppText>
        {sublabel ? (
          <AppText variant="caption" tone="secondary">
            {sublabel}
          </AppText>
        ) : null}
      </View>
      {right}
      {chevron ? <CaretRight size={18} color={colors.textTertiary} weight="regular" /> : null}
    </Tap>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 62, gap: 16 },
  icon: { width: 32, alignItems: 'center' },
  text: { flex: 1, gap: 2 },
});
