import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { errorMessage } from '@/api/client';
import { useQuery } from '@/api/query';
import { getEsim, transferEsim } from '@/api/sim';
import { CollapsingScreen } from '@/components/CollapsingScreen';
import { ArrowsLeftRight, Leaf, ShieldCheck, SimCard } from '@/components/icons';
import { Sheet } from '@/components/Sheet';
import { useToast } from '@/components/Toast';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Tap } from '@/components/ui/Tap';
import { colors, radius } from '@/theme/tokens';

const benefits = [
  { key: 'safe', Icon: ShieldCheck, title: 'Safe & Reliable', body: 'Your eSIM stays secure, no physical card to lose or damage' },
  { key: 'flexible', Icon: ArrowsLeftRight, title: 'More flexible', body: 'Easily switch between multiple numbers without swapping SIM cards' },
  { key: 'eco', Icon: Leaf, title: 'Eco-friendly', body: 'Go digital, reduce plastic waste with eSIM card' },
];

export default function EsimScreen() {
  const router = useRouter();
  const toast = useToast();
  const [sheetOpen, setSheetOpen] = useState(false);
  const esim = useQuery('sim/esim/', getEsim).data;
  const benefitIcon: Record<string, typeof ShieldCheck> = { safe: ShieldCheck, flexible: ArrowsLeftRight, eco: Leaf };
  const rows = esim ? esim.benefits.map((b) => ({ key: b.key, Icon: benefitIcon[b.key] ?? ShieldCheck, title: b.title, body: b.body })) : benefits;

  const tiles = [
    { key: 'transfer', label: 'Transfer to eSIM', onPress: () => setSheetOpen(true) },
    { key: 'recover', label: 'Recover eSIM', onPress: () => router.push('/esim/recover') },
  ];

  return (
    <>
      <CollapsingScreen
        title="eSIM"
        subtitle="The new generation SIM technology is a built-in digital SIM card in a device"
        headerExtra={
          <View style={{ flexDirection: 'row', marginTop: 18, gap: 12 }}>
            {tiles.map((t) => (
              <Tap
                key={t.key}
                accessibilityRole="button"
                accessibilityLabel={t.label}
                onPress={t.onPress}
                style={{
                  flex: 1,
                  backgroundColor: colors.glass,
                  borderRadius: radius.md,
                  padding: 14,
                  minHeight: 78,
                  justifyContent: 'flex-end',
                  gap: 10,
                }}>
                <SimCard size={22} color={colors.text} weight="light" />
                <AppText variant="caption" style={{ fontSize: 14 }}>
                  {t.label}
                </AppText>
              </Tap>
            ))}
          </View>
        }>
        {rows.map(({ key, Icon, title, body }) => (
          <View key={key} style={{ marginBottom: 22, flexDirection: 'row', gap: 14, alignItems: 'flex-start' }}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: colors.lineStrong,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Icon size={20} color={colors.accentIcon} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText variant="bodyMedium" style={{ fontSize: 15 }}>
                {title}
              </AppText>
              <AppText variant="caption" tone="secondary" style={{ marginTop: 3 }}>
                {body}
              </AppText>
            </View>
          </View>
        ))}
      </CollapsingScreen>

      <Sheet visible={sheetOpen} onClose={() => setSheetOpen(false)} title="ASAN IMZA activation required">
        <AppText variant="caption" tone="secondary" style={{ lineHeight: 20 }}>
          The use of the obtained eSIM “Asan İmza” service is possible only after applying to the Asan Certificate Services Center (ASXM) of the State Tax Service and obtaining the “Asan İmza” certificate.
        </AppText>
        <Button
          variant="gradient"
          size="lg"
          label="Continue"
          style={{ marginTop: 20 }}
          onPress={() => {
            setSheetOpen(false);
            transferEsim().catch((e: unknown) => toast(errorMessage(e)));
          }}
        />
      </Sheet>
    </>
  );
}
