import { useRouter } from 'expo-router';
import { useState } from 'react';
import { TextInput, View } from 'react-native';

import { errorMessage } from '@/api/client';
import { recoverEsim } from '@/api/sim';
import { NavHeader } from '@/components/NavHeader';
import { Screen } from '@/components/Screen';
import { useToast } from '@/components/Toast';
import { AzFlag } from '@/components/ui/Flag';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { noOutline } from '@/theme/inputs';
import { colors, font, radius } from '@/theme/tokens';

export default function EsimRecoverScreen() {
  const router = useRouter();
  const toast = useToast();
  const [code, setCode] = useState('');
  const [phone, setPhone] = useState('516643342');

  return (
    <Screen
      footer={
        <Button
          size="lg"
          label="Continue"
          disabled={code.trim().length < 4}
          onPress={() =>
            recoverEsim({ code: code.trim(), msisdn: `994${phone}` })
              .catch((e: unknown) => toast(errorMessage(e)))
              .finally(() => router.back())
          }
        />
      }>
      <NavHeader title="" subtitle={null} />
      <AppText variant="display" style={{ fontSize: 24, lineHeight: 30, marginTop: 4 }}>
        Enter recovery code
      </AppText>
      <AppText variant="caption" tone="secondary" style={{ marginTop: 8, lineHeight: 20 }}>
        The code is sent to transferred phone number. If you have trouble receiving the QR code, fill in the details below to restore it.
      </AppText>

      <View
        style={{
          marginTop: 20,
          backgroundColor: colors.card,
          borderRadius: radius.md,
          height: 56,
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}>
        <AzFlag size={24} />
        <AppText variant="body">+994</AppText>
        <View style={{ width: 1, height: 24, backgroundColor: colors.lineStrong }} />
        <TextInput
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          selectionColor={colors.accent}
          accessibilityLabel="Phone number"
          style={{ flex: 1, fontFamily: font.regular, fontSize: 17, color: colors.text, padding: 0, ...noOutline }}
        />
      </View>

      <View style={{ marginTop: 12 }}>
        <TextField label="Recovery code" value={code} onChangeText={setCode} keyboardType="number-pad" autoFocus />
      </View>
    </Screen>
  );
}
