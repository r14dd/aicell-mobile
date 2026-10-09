import { useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { noOutline } from '@/theme/inputs';
import { colors, font, radius } from '@/theme/tokens';

type Props = TextInputProps & { label: string; error?: string };

/** Outlined field with a floating label, as in the Steam top-up form. */
export function TextField({ label, error, value, onFocus, onBlur, style, ...rest }: Props) {
  const [focused, setFocused] = useState(false);
  const lifted = focused || !!value;
  return (
    <View>
      <View
        style={[
          styles.box,
          { borderColor: error ? colors.red : focused ? colors.accent : colors.lineStrong },
        ]}>
        <AppText
          style={[
            styles.label,
            lifted ? styles.labelLifted : styles.labelResting,
            { color: error ? colors.red : focused ? colors.accentLink : colors.textSecondary },
          ]}
          pointerEvents="none">
          {label}
        </AppText>
        <TextInput
          {...rest}
          value={value}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          placeholderTextColor={colors.textTertiary}
          selectionColor={colors.accent}
          cursorColor={colors.accent}
          style={[styles.input, style]}
        />
      </View>
      {error ? (
        <AppText variant="small" tone="red" style={{ marginTop: 6, marginLeft: 4 }}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    minHeight: 60,
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingTop: 22,
    paddingBottom: 8,
    justifyContent: 'center',
  },
  label: { position: 'absolute', left: 16 },
  labelResting: { top: 19, fontFamily: font.regular, fontSize: 16, lineHeight: 22 },
  labelLifted: { top: 9, fontFamily: font.medium, fontSize: 12, lineHeight: 16 },
  input: { fontFamily: font.regular, fontSize: 17, lineHeight: 22, color: colors.text, padding: 0, margin: 0, ...noOutline },
});
