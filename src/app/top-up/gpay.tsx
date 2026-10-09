import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Keyboard, StyleSheet, TextInput, View } from 'react-native';

import { GooglePaySheet } from '@/components/GooglePaySheet';
import { NavHeader } from '@/components/NavHeader';
import { Screen } from '@/components/Screen';
import { useToast } from '@/components/Toast';
import { AppText } from '@/components/ui/AppText';
import { Tap } from '@/components/ui/Tap';
import { topUpGooglePay } from '@/api/billing';
import { errorMessage } from '@/api/client';
import { money } from '@/data/mock';
import { signal } from '@/laya/store';
import { useLayaTarget } from '@/laya/targets';
import { useAccount } from '@/state/account';
import { noOutline } from '@/theme/inputs';
import { colors, font, radius } from '@/theme/tokens';

/** Digits and a single decimal separator; the keypad's comma counts as a point. */
function cleanAmount(text: string) {
  const [whole, ...fraction] = text.replace(',', '.').replace(/[^0-9.]/g, '').split('.');
  return fraction.length ? `${whole}.${fraction.join('')}` : whole;
}

/** Amount entry for a Google Pay top-up; the checkout itself is simulated in a sheet. */
export default function GooglePayScreen() {
  const router = useRouter();
  const toast = useToast();
  const { applyMoney } = useAccount();
  const [amount, setAmount] = useState('');
  const [checkout, setCheckout] = useState(false);

  const value = Number(amount);
  const canPay = Number.isFinite(value) && value > 0;

  const pay = () => {
    Keyboard.dismiss();
    setCheckout(true);
  };

  const paid = async () => {
    try {
      const res = await topUpGooglePay({ amount: money(value), payment_token: 'simulated', card_last4: '4471' });
      applyMoney(res);
      setCheckout(false);
      signal('paid');
      toast(`${money(value)} ₼ added to your balance`);
      if (router.canDismiss()) router.dismissAll();
      else router.replace('/');
    } catch (e) {
      setCheckout(false);
      signal('authFailed');
      toast(errorMessage(e));
    }
  };

  const amountRef = useRef<View>(null);
  const continueRef = useRef<View>(null);
  useLayaTarget('gpay.amount', amountRef, { setValue: (text) => setAmount(cleanAmount(text)) });
  useLayaTarget('gpay.continue', continueRef, {
    press: () => {
      if (canPay) pay();
    },
  });

  return (
    <Screen
      backgroundColor="#231C2E"
      contentStyle={{ flexGrow: 1 }}
      footer={
        <View>
          <AppText variant="caption" tone="tertiary" style={styles.note}>
            {"We don't charge for this transfer, but some banks may charge on their side"}
          </AppText>
          <View ref={continueRef} collapsable={false}>
          <Tap
            accessibilityRole="button"
            accessibilityLabel="Pay with Google Pay"
            accessibilityState={{ disabled: !canPay }}
            disabled={!canPay}
            onPress={pay}
            style={[styles.pay, { opacity: canPay ? 1 : 0.5 }]}>
            <AppText style={styles.payLabel}>{canPay ? 'Pay with Google Pay' : 'Google Pay'}</AppText>
          </Tap>
          </View>
        </View>
      }>
      <NavHeader />
      <View style={styles.center}>
        <View ref={amountRef} collapsable={false} style={styles.amountRow}>
          <TextInput
            value={amount}
            onChangeText={(t) => setAmount(cleanAmount(t))}
            accessibilityLabel="Amount"
            keyboardType="decimal-pad"
            inputMode="decimal"
            autoFocus
            selectionColor={colors.accent}
            placeholder="0"
            placeholderTextColor={colors.textSecondary}
            style={[styles.input, { width: Math.max(40, amount.length * 30 + 4) }]}
          />
          <AppText tone={amount ? 'primary' : 'secondary'} style={styles.currency}>
            ₼
          </AppText>
        </View>
      </View>
      <GooglePaySheet visible={checkout} amount={value} onClose={() => setCheckout(false)} onPaid={() => void paid()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', minHeight: 260 },
  amountRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', gap: 8 },
  input: {
    fontFamily: font.regular,
    fontSize: 46,
    color: colors.text,
    padding: 0,
    textAlign: 'right',
    minWidth: 40,
    ...noOutline,
  },
  currency: { fontFamily: font.regular, fontSize: 26 },
  note: { textAlign: 'center', paddingHorizontal: 24, marginBottom: 14, fontSize: 14, lineHeight: 19 },
  pay: {
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  payLabel: { fontFamily: font.semibold, fontSize: 17, lineHeight: 22, color: '#1F1F1F' },
});
