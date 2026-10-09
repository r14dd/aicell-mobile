import { StyleSheet, View } from 'react-native';

import { Check } from '@/components/icons';
import { AppText } from '@/components/ui/AppText';
import { Tap } from '@/components/ui/Tap';
import { colors } from '@/theme/tokens';

type Props = { checked: boolean; onChange: (next: boolean) => void; label: string };

export function Checkbox({ checked, onChange, label }: Props) {
  return (
    <Tap
      onPress={() => onChange(!checked)}
      pressScale={0.99}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      style={styles.row}>
      <View style={[styles.box, checked ? styles.boxOn : styles.boxOff]}>
        {checked ? <Check size={16} color={colors.text} weight="bold" /> : null}
      </View>
      <AppText variant="body" style={{ fontSize: 17, flex: 1 }}>
        {label}
      </AppText>
    </Tap>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 44 },
  box: { width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  boxOn: { backgroundColor: colors.accent },
  boxOff: { borderWidth: 1.5, borderColor: colors.lineStrong },
});
