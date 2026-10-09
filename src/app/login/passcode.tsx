import * as LocalAuthentication from 'expo-local-authentication';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CaretLeft, FingerprintSimple, User } from '@/components/icons';
import { useToast } from '@/components/Toast';
import { AppText } from '@/components/ui/AppText';
import { Tap } from '@/components/ui/Tap';
import { errorMessage } from '@/api/client';
import { useSession } from '@/state/session';
import { colors, font, layout, radius } from '@/theme/tokens';

const surface = '#231C2E';
const KEY = 64;
const GAP = 14;
const LENGTH = 6;
const ROWS: (string | 'finger' | '')[][] = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['finger', '0', ''],
];

/** OTP keypad after the number check; the demo code or a fingerprint opens the app. */
export default function PasscodeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const toast = useToast();
  const { signIn } = useSession();
  const { number } = useLocalSearchParams<{ number?: string }>();
  const [code, setCode] = useState('');

  /** The typed code (or the test code after a fingerprint) is verified by the server. */
  const enter = (otp?: string) => {
    signIn(String(number ?? ''), otp)
      .then(() => router.replace('/'))
      .catch((e: unknown) => {
        setCode('');
        toast(errorMessage(e));
      });
  };

  const press = (digit: string) => {
    if (code.length >= LENGTH) return;
    const next = code + digit;
    setCode(next);
    if (next.length === LENGTH) setTimeout(() => enter(next), 250);
  };

  const finger = async () => {
    try {
      const [hardware, enrolled] = await Promise.all([LocalAuthentication.hasHardwareAsync(), LocalAuthentication.isEnrolledAsync()]);
      if (hardware && enrolled) {
        const result = await LocalAuthentication.authenticateAsync({ promptMessage: 'Enter the app', cancelLabel: 'Cancel' });
        if (!result.success) return;
      }
    } catch {
      // no biometrics here: let the demo through
    }
    enter();
  };


  return (
    <View style={styles.root}>
      <View style={[styles.column, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24 }]}>
        <Tap hitSlop={12} haptic={false} accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()} style={styles.back}>
          <CaretLeft size={24} color={colors.text} />
        </Tap>
        <View style={styles.center}>
          <User size={76} color="#5B45D6" weight="fill" />
          <AppText style={styles.welcome}>Welcome!</AppText>
          <Tap haptic={false} accessibilityRole="button" onPress={() => toast('Passcode recovery is not part of this prototype yet')}>
            <AppText variant="caption" style={styles.forgot}>
              Forgot the passcode?
            </AppText>
          </Tap>
          <View style={styles.dots} accessibilityLabel={`${code.length} of ${LENGTH} digits entered`}>
            {Array.from({ length: LENGTH }, (_, i) => (
              <View key={i} style={[styles.dot, i < code.length && styles.dotOn]} />
            ))}
          </View>
          <View style={styles.keypad}>
            {ROWS.map((row, r) => (
              <View key={r} style={styles.keyRow}>
                {row.map((key, c) =>
                  key === '' ? (
                    <View key={c} style={styles.keyBlank} />
                  ) : key === 'finger' ? (
                    <Tap key={c} accessibilityRole="button" accessibilityLabel="Use fingerprint" onPress={() => void finger()} style={styles.keyBlank}>
                      <FingerprintSimple size={32} color={colors.text} weight="light" />
                    </Tap>
                  ) : (
                    <Tap key={c} accessibilityRole="button" accessibilityLabel={key} onPress={() => press(key)} style={styles.key}>
                      <AppText style={styles.keyText}>{key}</AppText>
                    </Tap>
                  ),
                )}
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: surface, alignItems: 'center' },
  column: { flex: 1, width: '100%', maxWidth: layout.maxWidth, paddingHorizontal: 16 },
  back: { width: 40, height: 40, justifyContent: 'center' },
  center: { alignItems: 'center', marginTop: 8 },
  welcome: { marginTop: 10, fontFamily: font.bold, fontSize: 20, lineHeight: 26, color: colors.text },
  forgot: { marginTop: 6, color: colors.accentLink },
  dots: { flexDirection: 'row', gap: 10, marginTop: 16 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#6B6478' },
  dotOn: { backgroundColor: colors.text },
  keypad: { marginTop: 22, gap: GAP },
  keyRow: { flexDirection: 'row', gap: GAP },
  key: { width: KEY, height: KEY, borderRadius: radius.md, backgroundColor: '#352E44', alignItems: 'center', justifyContent: 'center' },
  keyBlank: { width: KEY, height: KEY, alignItems: 'center', justifyContent: 'center' },
  keyText: { fontFamily: font.regular, fontSize: 22, lineHeight: 28, color: colors.text },
});
