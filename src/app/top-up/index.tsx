import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { ChartPieSlice, CreditCard, Ticket } from '@/components/icons';
import { NavHeader } from '@/components/NavHeader';
import { Screen } from '@/components/Screen';
import { AppText } from '@/components/ui/AppText';
import { ListRow } from '@/components/ui/ListRow';
import { Tap } from '@/components/ui/Tap';
import { img } from '@/data/assets';
import { getTopUpMethods } from '@/api/billing';
import { useQuery } from '@/api/query';
import { akartBannerAlt } from '@/data/kredit';
import { useLayaTarget } from '@/laya/targets';
import { colors, font, radius } from '@/theme/tokens';

export default function TopUpMethodScreen() {
  const router = useRouter();
  const gpayRef = useRef<View>(null);
  useLayaTarget('topup.googlePay', gpayRef, { press: () => router.push('/top-up/gpay') });
  const methods = useQuery('billing/top-up/methods/', getTopUpMethods).data;
  const label = (key: 'card' | 'akart' | 'voucher' | 'kredit', fallback: string) => methods?.methods.find((m) => m.key === key)?.label ?? fallback;
  const bannerAlt = methods?.banner.alt ?? akartBannerAlt;

  return (
    <Screen backgroundColor="#231C2E">
      <NavHeader />
      <AppText variant="title" style={{ fontSize: 20, lineHeight: 26, marginTop: 6 }}>
        Select a top-up method
      </AppText>

      <Tap
        accessibilityRole="button"
        accessibilityLabel={bannerAlt}
        onPress={() => router.push('/kredit/tamamla')}
        style={{ marginTop: 16 }}>
        <Image source={img.bannerAkart} style={{ width: '100%', aspectRatio: 526 / 181, borderRadius: radius.lg }} contentFit="cover" />
      </Tap>

      <View style={{ marginTop: 2 }}>
        <ListRow
          chevron={false}
          icon={<CreditCard size={24} color={colors.accentIcon} weight="light" />}
          label={label('card', 'Top up from bank card')}
          onPress={() => router.push('/top-up/card')}
        />
        <ListRow
          chevron={false}
          icon={<Image source={img.avatarMark} style={{ width: 24, height: 24, borderRadius: 12 }} />}
          label={label('akart', 'akart')}
          onPress={() => router.push('/top-up/akart')}
        />
        <ListRow
          chevron={false}
          icon={<Ticket size={24} color={colors.accentIcon} weight="light" />}
          label={label('voucher', 'Voucher')}
          onPress={() => router.push('/top-up/voucher')}
        />
        <ListRow
          chevron={false}
          icon={<ChartPieSlice size={24} color={colors.accentIcon} weight="light" />}
          label={label('kredit', 'Get Kredit')}
          onPress={() => router.push('/kredit')}
        />
      </View>

      <View style={styles.separator}>
        <View style={styles.hairline} />
        <AppText variant="label" tone="secondary" style={{ letterSpacing: 0.6 }}>
          OR TOP UP WITH GOOGLE PAY
        </AppText>
        <View style={styles.hairline} />
      </View>

      <View ref={gpayRef} collapsable={false}>
        <Tap accessibilityRole="button" accessibilityLabel="Google Pay" onPress={() => router.push('/top-up/gpay')} style={styles.pay}>
          <AppText style={styles.payLabel}>Google Pay</AppText>
        </Tap>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  separator: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  hairline: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.lineStrong },
  payLabel: { fontFamily: font.semibold, fontSize: 17, lineHeight: 22, color: '#1F1F1F' },
  pay: {
    marginTop: 24,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
