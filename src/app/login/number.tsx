import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CaretLeft } from '@/components/icons';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { AzFlag } from '@/components/ui/Flag';
import { Tap } from '@/components/ui/Tap';
import { noOutline } from '@/theme/inputs';
import { colors, font, layout, radius } from '@/theme/tokens';

const surface = '#231C2E';
const field = '#2B2438';
const DIGITS = 9;
const CHECK_MS = 900;

/** `516643342` → `51 664 33 42` while typing. */
function pretty(digits: string) {
  const parts = [digits.slice(0, 2), digits.slice(2, 5), digits.slice(5, 7), digits.slice(7, 9)].filter(Boolean);
  return parts.join(' ');
}

/** Manual number entry: nine digits after +994, then a short check before the passcode. */
export default function EnterNumberScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [digits, setDigits] = useState('');
  const [checking, setChecking] = useState(false);
  const complete = digits.length === DIGITS;

  const next = () => {
    setChecking(true);
    setTimeout(() => {
      setChecking(false);
      router.push({ pathname: '/login/passcode', params: { number: digits } });
    }, CHECK_MS);
  };

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[styles.column, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16 }]}>
        <Tap hitSlop={12} haptic={false} accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()} style={styles.back}>
          <CaretLeft size={24} color={colors.text} />
        </Tap>
        <AppText style={styles.title}>Enter your number</AppText>
        <AppText variant="body" tone="secondary" style={styles.subtitle}>
          {'Enter the "Azercell" app to get information about the number and carry out transactions'}
        </AppText>

        <View style={styles.fieldRow}>
          <View style={styles.prefix}>
            <AzFlag size={20} />
            <AppText variant="bodyMedium" style={{ fontSize: 16 }}>
              +994
            </AppText>
          </View>
          <View style={styles.inputBox}>
            <TextInput
              value={pretty(digits)}
              onChangeText={(text) => setDigits(text.replace(/\D/g, '').slice(0, DIGITS))}
              accessibilityLabel="Phone number"
              keyboardType="number-pad"
              inputMode="numeric"
              autoFocus
              selectionColor={colors.accent}
              placeholder="Phone number"
              placeholderTextColor={colors.textSecondary}
              style={styles.input}
            />
          </View>
        </View>
        <AppText variant="small" tone="secondary" style={styles.counter}>
          {`${digits.length}/${DIGITS}`}
        </AppText>

        <View style={{ flex: 1 }} />
        <Button label="Continue" size="lg" disabled={!complete} onPress={next} />
      </KeyboardAvoidingView>
      {checking ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.text} size="large" />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: surface, alignItems: 'center' },
  column: { flex: 1, width: '100%', maxWidth: layout.maxWidth, paddingHorizontal: 16 },
  back: { width: 40, height: 40, justifyContent: 'center' },
  title: { marginTop: 18, fontFamily: font.bold, fontSize: 26, lineHeight: 32, color: colors.text },
  subtitle: { marginTop: 8, fontSize: 14, lineHeight: 19 },
  fieldRow: { flexDirection: 'row', gap: 8, marginTop: 56 },
  prefix: { height: 48, paddingHorizontal: 14, borderRadius: radius.md, backgroundColor: field, flexDirection: 'row', alignItems: 'center', gap: 8 },
  inputBox: { flex: 1, height: 48, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.accent, justifyContent: 'center', paddingHorizontal: 14 },
  input: { fontFamily: font.regular, fontSize: 16, color: colors.text, padding: 0, ...noOutline },
  counter: { alignSelf: 'flex-end', marginTop: 6 },
  loading: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000000', alignItems: 'center', justifyContent: 'center' },
});
