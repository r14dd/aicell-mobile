import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { GradientScreen } from '@/components/GradientScreen';
import { HelpCard } from '@/components/HelpCard';
import { CaretLeft, CaretRight, Plus } from '@/components/icons';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Divider } from '@/components/ui/Divider';
import { Tap } from '@/components/ui/Tap';
import { money } from '@/data/mock';
import { useSteam } from '@/state/steam';
import { colors, layout, radius } from '@/theme/tokens';

export default function SavedSteamAccountsScreen() {
  const router = useRouter();
  const { accounts } = useSteam();

  return (
    <GradientScreen
      withTabBar={false}
      header={
        <View style={{ paddingHorizontal: layout.gutter }}>
          <Tap
            hitSlop={12}
            haptic={false}
            accessibilityRole="button"
            accessibilityLabel="Back"
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
            style={{ height: 56, justifyContent: 'center', alignSelf: 'flex-start' }}>
            <CaretLeft size={26} color={colors.text} />
          </Tap>
          <AppText variant="display" style={{ fontSize: 30, lineHeight: 36, marginTop: 8 }}>
            Saved Steam accounts
          </AppText>
          <AppText variant="body" style={{ fontSize: 17, marginTop: 8 }}>
            No VAT or commission fees
          </AppText>
          <Tap
            accessibilityRole="button"
            accessibilityLabel="Top up new account"
            onPress={() => router.push('/steam/top-up')}
            style={{
              marginTop: 20,
              backgroundColor: colors.glass,
              borderRadius: radius.md,
              paddingHorizontal: 16,
              height: 66,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 14,
            }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: colors.accent,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Plus size={20} color={colors.text} weight="bold" />
            </View>
            <AppText variant="body" style={{ fontSize: 18, flex: 1 }}>
              Top up new account
            </AppText>
            <CaretRight size={20} color={colors.text} />
          </Tap>
        </View>
      }>
      {accounts.length === 0 ? (
        <Card style={{ paddingVertical: 36, alignItems: 'center' }}>
          <AppText variant="title" style={{ fontSize: 24, lineHeight: 30, textAlign: 'center' }}>
            Saved Steam accounts will be shown here
          </AppText>
          <AppText variant="body" tone="secondary" style={{ fontSize: 17, marginTop: 10, textAlign: 'center' }}>
            You don&apos;t have saved accounts yet
          </AppText>
        </Card>
      ) : (
        <Card padded={false} style={{ paddingHorizontal: 20 }}>
          {accounts.map((account, i) => (
            <View key={account.id}>
              {i > 0 ? <Divider /> : null}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 }}>
                <View style={{ flex: 1 }}>
                  <AppText variant="body" style={{ fontSize: 17 }}>
                    {account.name}
                  </AppText>
                  {account.lastAmount !== null && account.lastDate ? (
                    <AppText variant="caption" tone="secondary">
                      {`Last top-up ${money(account.lastAmount)} ₼ on ${account.lastDate}`}
                    </AppText>
                  ) : null}
                </View>
                <Button
                  size="sm"
                  label="Top up"
                  onPress={() => router.push({ pathname: '/steam/top-up', params: { account: account.name } })}
                />
              </View>
            </View>
          ))}
        </Card>
      )}
      <View style={{ marginTop: 16 }}>
        <HelpCard />
      </View>
    </GradientScreen>
  );
}
