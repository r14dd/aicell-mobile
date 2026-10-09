import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { TextInput, View } from 'react-native';

import { Question } from '@/components/icons';
import { NavHeader } from '@/components/NavHeader';
import { Screen } from '@/components/Screen';
import { useToast } from '@/components/Toast';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Tap } from '@/components/ui/Tap';
import { TextField } from '@/components/ui/TextField';
import { ApiError, errorMessage, newIdempotencyKey } from '@/api/client';
import { topUpSteam } from '@/api/steam';
import { money } from '@/data/mock';
import { useAccount } from '@/state/account';
import { useSteam } from '@/state/steam';
import { noOutline } from '@/theme/inputs';
import { colors, font, radius } from '@/theme/tokens';

export default function TopUpSteamScreen() {
  const router = useRouter();
  const toast = useToast();
  const { chips, limits, refresh } = useSteam();
  const { applyMoney } = useAccount();
  const params = useLocalSearchParams<{ account?: string }>();

  const [name, setName] = useState(params.account ?? '');
  const [amount, setAmount] = useState('');
  const [save, setSave] = useState(true);
  const [busy, setBusy] = useState(false);
  // One key per attempt: only a lost connection reuses it, so the retry cannot charge twice.
  const attempt = useRef<{ sent: string; key: string } | null>(null);

  const value = Number(amount.replace(',', '.'));
  const inRange = Number.isFinite(value) && value >= limits.min && value <= limits.max;
  const valid = name.trim().length > 0 && inRange && !busy;
  const showError = amount.trim().length > 0 && !inRange;

  const submit = async () => {
    const body = { account: name.trim(), amount: money(value), save };
    const sent = JSON.stringify(body);
    if (attempt.current?.sent !== sent) attempt.current = { sent, key: newIdempotencyKey() };
    setBusy(true);
    try {
      const res = await topUpSteam(body, attempt.current.key);
      attempt.current = null;
      applyMoney(res);
      if (save) void refresh();
      toast(`${money(value)} ₼ sent to Steam account ${body.account}`);
      if (router.canGoBack()) router.back();
      else router.replace('/steam');
    } catch (e) {
      if (!(e instanceof ApiError && e.status === 0)) attempt.current = null;
      // 402 carries the "not enough balance" wording, 400 the first field message.
      toast(e instanceof ApiError && e.errors ? Object.values(e.errors)[0][0] : errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen footer={<Button size="lg" label="Top up" disabled={!valid} onPress={() => void submit()} />}>
      <NavHeader
        right={
          <Tap
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Help"
            onPress={() => toast('Steam top-up help is not part of this prototype yet')}>
            <Question size={26} color={colors.text} />
          </Tap>
        }
      />
      <AppText variant="display" style={{ fontSize: 28, lineHeight: 34, marginTop: 8 }}>
        Top up Steam
      </AppText>
      <AppText variant="body" style={{ fontSize: 17, marginTop: 8 }}>
        No VAT or commission fees
      </AppText>

      <View style={{ marginTop: 20 }}>
        <TextField
          label="Steam account name"
          value={name}
          onChangeText={setName}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="next"
        />
      </View>

      <View
        style={{
          marginTop: 16,
          backgroundColor: colors.card,
          borderRadius: radius.md,
          paddingHorizontal: 20,
          height: 64,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}>
        <AppText variant="subheading" style={{ fontFamily: font.regular }}>
          Amount
        </AppText>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          accessibilityLabel="Amount"
          textAlign="right"
          keyboardType="decimal-pad"
          inputMode="decimal"
          placeholder="1.00 - 50.00 ₼"
          placeholderTextColor={colors.textSecondary}
          selectionColor={colors.accent}
          style={{ flex: 1, fontFamily: font.regular, fontSize: 17, color: colors.text, padding: 0, ...noOutline }}
        />
      </View>
      {showError ? (
        <AppText variant="small" tone="red" style={{ marginTop: 6, marginLeft: 4 }}>
          {`Enter an amount between ${money(limits.min)} and ${money(limits.max)} ₼`}
        </AppText>
      ) : null}

      <View style={{ marginTop: 16, flexDirection: 'row', gap: 12 }} accessibilityRole="radiogroup">
        {chips.map((n) => {
          const selected = value === n;
          return (
            <Tap
              key={n}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => setAmount(String(n))}
              style={{
                flex: 1,
                height: 46,
                borderRadius: radius.pill,
                borderWidth: 1,
                borderColor: selected ? colors.accent : colors.lineStrong,
                backgroundColor: selected ? colors.accent : undefined,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <AppText variant="bodyMedium">{`${n} ₼`}</AppText>
            </Tap>
          );
        })}
      </View>

      <View style={{ marginTop: 28 }}>
        <Checkbox checked={save} onChange={setSave} label="Save account for future top-ups" />
      </View>
    </Screen>
  );
}
