import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AvatarButton } from '@/components/AvatarButton';
import { Bell, CaretDown, Check } from '@/components/icons';
import { Sheet } from '@/components/Sheet';
import { useToast } from '@/components/Toast';
import { AppText } from '@/components/ui/AppText';
import { Tap } from '@/components/ui/Tap';
import { errorMessage } from '@/api/client';
import { useSession } from '@/state/session';
import { colors, font, layout, radius } from '@/theme/tokens';

/** Header row on tab screens: plan + number (tap to switch), animated mascot, notifications. */
export function TopBar() {
  const { account, accounts, signIn } = useSession();
  const toast = useToast();
  const router = useRouter();
  const [picker, setPicker] = useState(false);

  const choose = (number: string) => {
    setPicker(false);
    if (number === account.number) return;
    signIn(number)
      .then(() => toast(`Switched to ${number}`))
      .catch((e: unknown) => toast(errorMessage(e)));
  };

  return (
    <View style={styles.row}>
      <Tap
        haptic={false}
        pressScale={0.99}
        accessibilityRole="button"
        accessibilityLabel={`${account.plan} ${account.number}, switch number`}
        onPress={() => setPicker(true)}
        style={styles.number}>
        <AppText variant="small" tone="onHeaderSecondary">
          {account.plan}
        </AppText>
        <View style={styles.numberRow}>
          <AppText style={styles.numberText}>{account.number}</AppText>
          <CaretDown size={14} color={colors.text} weight="bold" />
        </View>
      </Tap>
      <AvatarButton />
      <Tap
        hitSlop={8}
        haptic={false}
        accessibilityRole="button"
        accessibilityLabel="Notifications"
        onPress={() => router.push('/notifications')}>
        <Bell size={24} color={colors.text} weight="regular" />
      </Tap>

      <Sheet visible={picker} onClose={() => setPicker(false)} title="Select number">
        <View style={{ marginTop: 12, gap: 8 }}>
          {accounts.map((a) => {
            const current = a.number === account.number;
            return (
              <Tap
                key={a.number}
                haptic={false}
                pressScale={0.99}
                accessibilityRole="button"
                accessibilityState={{ selected: current }}
                accessibilityLabel={`${a.number}, ${a.name}`}
                onPress={() => choose(a.number)}
                style={[styles.option, current && styles.optionOn]}>
                <View style={{ flex: 1, gap: 2 }}>
                  <AppText style={styles.optionNumber}>{a.number}</AppText>
                  <AppText variant="caption" tone="secondary">
                    {`${a.name} · ${a.tariff}`}
                  </AppText>
                </View>
                {current ? <Check size={20} color={colors.accentIcon} weight="bold" /> : null}
              </Tap>
            );
          })}
        </View>
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: layout.gutter, gap: 16, height: 52 },
  number: { flex: 1, gap: 2 },
  numberRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  numberText: { fontFamily: font.semibold, fontSize: 18, lineHeight: 24, color: colors.text },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 64, paddingHorizontal: 16, borderRadius: radius.lg, backgroundColor: colors.cardRaised },
  optionOn: { borderWidth: 1, borderColor: colors.accentIcon },
  optionNumber: { fontFamily: font.semibold, fontSize: 17, lineHeight: 22, color: colors.text },
});
