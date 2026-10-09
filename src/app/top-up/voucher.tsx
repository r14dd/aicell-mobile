import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { SquaresFour } from '@/components/icons';
import { NavHeader } from '@/components/NavHeader';
import { Screen } from '@/components/Screen';
import { useToast } from '@/components/Toast';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Tap } from '@/components/ui/Tap';
import { topUpVoucher } from '@/api/billing';
import { errorMessage } from '@/api/client';
import { colors, font } from '@/theme/tokens';

const DIGITS = 13;

/** 13-digit voucher entry; one invisible input sits over the digit row and the row renders its value. The recording never shows a completed code. */
export default function VoucherScreen() {
  const toast = useToast();
  const [code, setCode] = useState('');

  return (
    <Screen
      backgroundColor="#231C2E"
      footer={
        <Button
          size="lg"
          label="Top up mobile"
          disabled={code.length < DIGITS}
          onPress={() => void topUpVoucher({ code: code }).catch((e: unknown) => toast(errorMessage(e)))}
        />
      }>
      <NavHeader />
      <View style={styles.card}>
        <Image source={require('@/assets/images/ref/voucher-card.png')} style={StyleSheet.absoluteFill} contentFit="cover" />
        <AppText variant="small" pointerEvents="none" style={styles.caption}>
          13 digit voucher code
        </AppText>
        <View pointerEvents="none" style={styles.digits}>
          {Array.from({ length: DIGITS }, (_, i) => (
            <AppText key={i} style={[styles.digit, i >= code.length && styles.placeholder]}>
              {code[i] ?? '0'}
            </AppText>
          ))}
        </View>
        <TextInput
          value={code}
          onChangeText={(t) => setCode(t.replace(/\D/g, '').slice(0, DIGITS))}
          keyboardType="number-pad"
          maxLength={DIGITS}
          autoFocus
          accessibilityLabel="13 digit voucher code"
          style={styles.hiddenInput}
        />
        <Tap
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Scan voucher code"
          onPress={() => toast('Scanning a voucher is not part of this prototype yet')}
          style={styles.scan}>
          <SquaresFour size={23} color={colors.text} />
        </Tap>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: 16, marginHorizontal: 17, aspectRatio: 472 / 300, borderRadius: 16, overflow: 'hidden' },
  caption: { position: 'absolute', left: 19, top: 55 },
  digits: { position: 'absolute', left: 11, top: 78, flexDirection: 'row' },
  digit: { width: 22, height: 30, textAlign: 'center', fontFamily: font.regular, fontSize: 22, lineHeight: 30, color: colors.text },
  placeholder: { color: 'rgba(255,255,255,0.45)' },
  hiddenInput: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, opacity: 0 },
  scan: { position: 'absolute', top: 19, right: 19 },
});
