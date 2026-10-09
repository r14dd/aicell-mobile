import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { NavHeader } from '@/components/NavHeader';
import { Screen } from '@/components/Screen';
import { useToast } from '@/components/Toast';
import { AzFlag } from '@/components/ui/Flag';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { TextField } from '@/components/ui/TextField';
import { toMsisdn, topUpAkart } from '@/api/billing';
import { ApiError, errorMessage } from '@/api/client';
import { money } from '@/data/mock';
import { useAccount } from '@/state/account';
import { noOutline } from '@/theme/inputs';
import { colors, font, radius } from '@/theme/tokens';

/** akart number and amount; the recording ends before any confirmation, so Continue credits the in-memory balance. */
export default function TopUpWithAkartScreen() {
  const router = useRouter();
  const toast = useToast();
  const { applyMoney } = useAccount();
  const [busy, setBusy] = useState(false);
  const [phone, setPhone] = useState('51 664 33 42');
  const [amount, setAmount] = useState('');
  const [save, setSave] = useState(true);

  const value = Number(amount.replace(',', '.'));
  const canContinue = Number.isFinite(value) && value > 0 && !busy;

  const submit = async () => {
    setBusy(true);
    try {
      const res = await topUpAkart({ akart_msisdn: toMsisdn(phone), amount: money(value), save });
      applyMoney(res);
      toast(`${money(value)} ₼ added to your balance`);
      if (router.canDismiss()) router.dismissAll();
      else router.replace('/');
    } catch (e) {
      toast(e instanceof ApiError && e.errors ? Object.values(e.errors)[0][0] : errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen
      backgroundColor="#231C2E"
      footer={
        <View>
          <Checkbox checked={save} onChange={setSave} label="Save akart number for future top-ups" />
          <Button size="lg" label="Continue" disabled={!canContinue} onPress={() => void submit()} style={{ marginTop: 4 }} />
        </View>
      }>
      <NavHeader />
      <AppText variant="title" style={{ fontSize: 20, lineHeight: 26, marginTop: 6 }}>
        Top up with akart
      </AppText>

      <View style={{ marginTop: 12, flexDirection: 'row', gap: 10 }}>
        <View style={[styles.tile, { width: 102, gap: 10 }]}>
          <AzFlag size={24} />
          <AppText variant="body" style={{ fontSize: 17 }}>
            +994
          </AppText>
        </View>
        <View style={[styles.tile, { flex: 1 }]}>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            selectionColor={colors.accent}
            accessibilityLabel="Phone number"
            style={styles.phone}
          />
        </View>
      </View>

      <View style={{ marginTop: 12, backgroundColor: colors.cardRaised, borderRadius: radius.md }}>
        <TextField label="Amount" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" inputMode="decimal" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  tile: {
    height: 60,
    borderRadius: radius.md,
    backgroundColor: colors.cardRaised,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  phone: { flex: 1, fontFamily: font.regular, fontSize: 17, color: colors.text, padding: 0, ...noOutline },
});
