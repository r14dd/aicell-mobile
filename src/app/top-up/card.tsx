import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { CreditCard } from '@/components/icons';
import { NavHeader } from '@/components/NavHeader';
import { Screen } from '@/components/Screen';
import { useToast } from '@/components/Toast';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { topUpCard } from '@/api/billing';
import { ApiError, errorMessage } from '@/api/client';
import { money } from '@/data/mock';
import { useAccount } from '@/state/account';
import { colors, radius } from '@/theme/tokens';

/** Card BIN and amount for a bank-card top-up; the recording ends before any confirmation, so Continue credits the in-memory balance. */
export default function AddPaymentDetailsScreen() {
  const router = useRouter();
  const toast = useToast();
  const { applyMoney } = useAccount();
  const [busy, setBusy] = useState(false);
  const [bin, setBin] = useState('');
  const [amount, setAmount] = useState('');

  const value = Number(amount.replace(',', '.'));
  const canContinue = bin.length === 6 && Number.isFinite(value) && value > 0 && !busy;

  const submit = async () => {
    setBusy(true);
    try {
      const res = await topUpCard({ card_bin: bin, amount: money(value) });
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
      footer={<Button size="lg" label="Continue" disabled={!canContinue} onPress={() => void submit()} />}>
      <NavHeader />
      <AppText variant="title" style={{ fontSize: 20, lineHeight: 26, marginTop: 6 }}>
        Add payment details
      </AppText>

      <View style={{ marginTop: 16, backgroundColor: colors.cardRaised, borderRadius: radius.md }}>
        <TextField
          label="First 6 digits of bank card"
          value={bin}
          onChangeText={(t) => setBin(t.replace(/\D/g, ''))}
          keyboardType="number-pad"
          maxLength={6}
        />
        <View pointerEvents="none" style={{ position: 'absolute', top: 0, bottom: 0, right: 16, justifyContent: 'center' }}>
          <CreditCard size={20} color={colors.text} />
        </View>
      </View>

      <View style={{ marginTop: 12, backgroundColor: colors.cardRaised, borderRadius: radius.md }}>
        <TextField label="Amount" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" inputMode="decimal" />
      </View>
    </Screen>
  );
}
