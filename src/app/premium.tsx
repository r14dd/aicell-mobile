import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { useQuery } from '@/api/query';
import { activatePremium, getPremium, runTariffAction, tariffPath, toPremium } from '@/api/tariffs';
import { Crown, Gift, Headset, ShieldCheck, Sparkle, Ticket, UserCircle, X } from '@/components/icons';
import { Screen } from '@/components/Screen';
import { useToast } from '@/components/Toast';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Tap } from '@/components/ui/Tap';
import { premiumSeed } from '@/data/tariffs';
import { colors } from '@/theme/tokens';

// Keys the server adds beyond these fall back to the sparkle badge.
const benefitIcons: Record<string, ReactNode> = {
  curator: <UserCircle size={18} color="#1A1410" />,
  priority: <Headset size={18} color="#1A1410" />,
  free: <Sparkle size={18} color="#1A1410" />,
  kinon: <Ticket size={18} color="#1A1410" />,
  pasha: <ShieldCheck size={18} color="#1A1410" />,
  ateshgah: <ShieldCheck size={18} color="#1A1410" />,
  wolt: <Gift size={18} color="#1A1410" />,
  theme: <Crown size={18} color="#1A1410" />,
};

export default function PremiumScreen() {
  const router = useRouter();
  const toast = useToast();
  const { data: premium = premiumSeed } = useQuery(tariffPath.premium, () => getPremium().then(toPremium), premiumSeed);

  return (
    <Screen footer={<Button variant="gradient" size="lg" label="Continue" onPress={() => void runTariffAction(activatePremium, toast)} />}>
      <View style={styles.top}>
        <Tap
          hitSlop={12}
          haptic={false}
          accessibilityRole="button"
          accessibilityLabel="Close"
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          style={{ alignSelf: 'flex-start' }}>
          <X size={24} color={colors.text} />
        </Tap>
      </View>
      <Image
        source={require('@/assets/images/ref/premium-logo.png')}
        style={styles.logo}
        contentFit="contain"
        accessibilityLabel="Premium"
      />
      <AppText variant="bodySemibold" style={{ marginTop: 24, marginBottom: 10 }}>
        What’s included:
      </AppText>
      {premium.benefits.map((b) => (
        <View key={b.key} style={styles.benefit}>
          <View style={styles.badge}>{benefitIcons[b.key] ?? <Sparkle size={18} color="#1A1410" />}</View>
          <AppText variant="body" style={{ fontSize: 15, lineHeight: 21, flex: 1 }}>
            {b.text}
          </AppText>
        </View>
      ))}
      <View style={styles.note}>
        <AppText variant="small" tone="secondary" style={{ textAlign: 'center' }}>
          {premium.note}
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { height: 56, justifyContent: 'center' },
  logo: { alignSelf: 'center', width: 200, aspectRatio: 300 / 80, marginTop: 8 },
  benefit: {
    marginTop: 10,
    backgroundColor: '#121212', borderWidth: 1, borderColor: 'rgba(217,180,143,0.6)',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  badge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#D9B48F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  note: { marginTop: 16, backgroundColor: colors.cardRaised, borderRadius: 14, padding: 14 },
});
