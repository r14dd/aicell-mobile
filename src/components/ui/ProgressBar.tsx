import { View } from 'react-native';

import { colors } from '@/theme/tokens';

export function ProgressBar({ value, color = colors.accent }: { value: number; color?: string }) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(pct) }}
      style={{ height: 4, borderRadius: 2, backgroundColor: colors.lineStrong, overflow: 'hidden' }}>
      <View style={{ width: `${pct}%`, height: 4, borderRadius: 2, backgroundColor: color }} />
    </View>
  );
}
