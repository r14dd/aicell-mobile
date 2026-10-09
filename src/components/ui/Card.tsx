import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius } from '@/theme/tokens';

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
  color?: string;
};

export function Card({ children, style, padded = true, color = colors.card }: Props) {
  return (
    <View
      style={[
        { backgroundColor: color, borderRadius: radius.lg, overflow: 'hidden' },
        padded ? { padding: 18 } : null,
        style,
      ]}>
      {children}
    </View>
  );
}
