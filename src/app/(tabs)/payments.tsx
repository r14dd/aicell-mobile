import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { GradientScreen } from '@/components/GradientScreen';
import { CreditCard, DeviceMobile, Receipt, SteamLogo, WifiHigh } from '@/components/icons';
import { useToast } from '@/components/Toast';
import { TopBar } from '@/components/TopBar';
import { AppText, tabular } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Divider } from '@/components/ui/Divider';
import { ListRow } from '@/components/ui/ListRow';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { Tap } from '@/components/ui/Tap';
import { money } from '@/data/mock';
import { useAccount } from '@/state/account';
import { useSession } from '@/state/session';
import { colors, font, layout, radius } from '@/theme/tokens';

const AMOUNTS = [5, 10, 20, 50] as const;

/** Payments tab (not photographed; designed inside the same system). */
export default function PaymentsScreen() {
  const { account } = useSession();
  const router = useRouter();
  const toast = useToast();
  const [amount, setAmount] = useState<number>(10);
  const { balance, transactions } = useAccount();
  const icon = (node: React.ReactNode) => <View style={styles.rowIcon}>{node}</View>;

  return (
    <GradientScreen
      pinned={<TopBar />}
      header={
        <>
          <View style={{ paddingHorizontal: layout.gutter, marginTop: 10 }}>
            <AppText variant="display" style={{ fontSize: 30 }}>
              Payments
            </AppText>
            <View style={styles.balance}>
              <View>
                <AppText variant="small" tone="onHeaderSecondary">
                  Main balance
                </AppText>
                <AppText variant="title" style={[tabular, { fontSize: 28, marginTop: 2 }]}>
                  {money(balance)} ₼
                </AppText>
              </View>
              <Button label="History" variant="glass" size="sm" onPress={() => toast('Payment history is not part of this prototype yet')} />
            </View>
          </View>
        </>
      }>
      <Card>
        <AppText variant="subheading" style={{ fontFamily: font.regular }}>
          Top up my number
        </AppText>
        <AppText variant="caption" tone="secondary" style={{ marginTop: 4 }}>
          {account.number}
        </AppText>
        <View style={styles.chips}>
          {AMOUNTS.map((n) => {
            const on = n === amount;
            return (
              <Tap
                key={n}
                onPress={() => setAmount(n)}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                style={[styles.chip, on && styles.chipOn]}>
                <AppText variant="bodyMedium" style={tabular}>
                  {n} ₼
                </AppText>
              </Tap>
            );
          })}
        </View>
        <Button
          label={`Top up ${money(amount)} ₼`}
          size="lg"
          style={{ marginTop: 18 }}
          onPress={() => toast('Card payment is not part of this prototype yet')}
        />
      </Card>

      <SectionTitle title="Pay for" />
      <Card padded={false} style={{ paddingHorizontal: 20 }}>
        <ListRow
          icon={icon(<DeviceMobile size={26} color={colors.accentIcon} weight="light" />)}
          label="Another number"
          sublabel="Top up any Azercell balance"
          onPress={() => toast('Paying for another number is not part of this prototype yet')}
        />
        <Divider />
        <ListRow
          icon={icon(<SteamLogo size={26} color={colors.accentIcon} weight="light" />)}
          label="Steam balance"
          sublabel="No VAT or commission fees"
          onPress={() => router.push('/steam')}
        />
        <Divider />
        <ListRow
          icon={icon(<WifiHigh size={26} color={colors.accentIcon} weight="light" />)}
          label="Aztelekom home internet"
          sublabel="Monthly fiber subscription"
          onPress={() => toast('Aztelekom payments are not part of this prototype yet')}
        />
        <Divider />
        <ListRow
          icon={icon(<Receipt size={26} color={colors.accentIcon} weight="light" />)}
          label="Utilities"
          sublabel="Electricity, gas, water"
          onPress={() => toast('Utility payments are not part of this prototype yet')}
        />
      </Card>

      <SectionTitle title="Saved cards" action="Add card" onAction={() => toast('Adding a card is not part of this prototype yet')} />
      <Card padded={false} style={{ paddingHorizontal: 20 }}>
        <ListRow
          icon={icon(<CreditCard size={26} color={colors.accentIcon} weight="light" />)}
          label="Bank card ending 4471"
          sublabel="Expires 09/28"
          onPress={() => toast('Card settings are not part of this prototype yet')}
        />
      </Card>

      <SectionTitle title="Recent payments" />
      <Card padded={false} style={{ paddingHorizontal: 20 }}>
        {transactions.map((t, i) => (
          <View key={t.id}>
            {i > 0 ? <Divider /> : null}
            <View style={styles.tx}>
              <View style={{ flex: 1, gap: 2 }}>
                <AppText variant="body" style={{ fontSize: 17 }}>
                  {t.title}
                </AppText>
                <AppText variant="caption" tone="secondary">
                  {t.date}
                </AppText>
              </View>
              <AppText variant="bodySemibold" tone={t.amount < 0 ? 'primary' : 'green'} style={tabular}>
                {t.amount < 0 ? '-' : '+'}{money(Math.abs(t.amount))} ₼
              </AppText>
            </View>
          </View>
        ))}
      </Card>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  balance: {
    marginTop: 16,
    backgroundColor: colors.glass,
    borderRadius: radius.lg,
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chips: { flexDirection: 'row', gap: 10, marginTop: 18 },
  chip: {
    flex: 1,
    height: 44,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  rowIcon: { width: 32, alignItems: 'center' },
  tx: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 12 },
});
