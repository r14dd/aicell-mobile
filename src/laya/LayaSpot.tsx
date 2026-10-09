import { useRef, type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useLayaTarget, type TargetHandlers } from '@/laya/targets';

type Props = TargetHandlers & { id: string; style?: StyleProp<ViewStyle>; children: ReactNode };

/** Wraps a control so Laya can point at it and press it or fill it. */
export function LayaSpot({ id, press, setValue, style, children }: Props) {
  const ref = useRef<View>(null);
  useLayaTarget(id, ref, { press, setValue });
  return (
    <View ref={ref} collapsable={false} style={style}>
      {children}
    </View>
  );
}
