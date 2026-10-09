import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, layout } from '@/theme/tokens';

type Props = {
  children: ReactNode;
  /** Pinned below the scroll area (e.g. a submit button). */
  footer?: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  /** Page colour; the recorded top-up screens sit on a dark violet rather than the black sheet. */
  backgroundColor?: string;
};

/** Black detail-screen frame with safe areas and keyboard avoidance. */
export function Screen({ children, footer, contentStyle, backgroundColor = colors.bg }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor, paddingTop: Math.max(insets.top, 14) }}>
      <ScrollView
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          { paddingHorizontal: layout.gutter, paddingBottom: footer ? 16 : insets.bottom + 32 },
          contentStyle,
        ]}>
        {children}
      </ScrollView>
      {footer ? (
        <View style={{ paddingHorizontal: layout.gutter, paddingTop: 8, paddingBottom: Math.max(insets.bottom, 16) }}>{footer}</View>
      ) : null}
    </KeyboardAvoidingView>
  );
}
