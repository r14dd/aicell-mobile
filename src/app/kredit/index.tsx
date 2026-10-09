import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { GradientScreen } from '@/components/GradientScreen';
import { Broadcast, Coins } from '@/components/icons';
import { NavHeader } from '@/components/NavHeader';
import { useToast } from '@/components/Toast';
import { AppText, tabular } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { Pill } from '@/components/ui/Pill';
import { Tap } from '@/components/ui/Tap';
import { getKredit, getTamamla } from '@/api/kredit';
import { useQuery } from '@/api/query';
import { img } from '@/data/assets';
import { kreditSeed, tamamlaSeed } from '@/data/kredit';
import { money } from '@/data/mock';
import { colors, font, layout, radius } from '@/theme/tokens';

export default function GetKreditScreen() {
  const router = useRouter();
  const toast = useToast();
  const { data: kredit = kreditSeed } = useQuery('kredit/', getKredit, kreditSeed);
  // Only the banner's alt text is needed here; the Tamamla page reads the same cached answer.
  const { data: tamamla = tamamlaSeed } = useQuery('kredit/tamamla/', getTamamla, tamamlaSeed);

  return (
    <GradientScreen
      withTabBar={false}
      header={
        <View style={{ paddingHorizontal: layout.gutter }}>
          <NavHeader title="Get Kredit" subtitle={null} />
          <View style={{ marginTop: 8, backgroundColor: colors.glass, borderRadius: radius.lg, padding: 16 }}>
            <AppText variant="caption" tone="onHeaderSecondary">
              My debt
            </AppText>
            <AppText variant="title" style={[tabular, { fontSize: 28, marginTop: 4 }]}>
              {money(kredit.debt.amount)} ₼
            </AppText>
            <AppText variant="small" tone="onHeaderSecondary" style={{ marginTop: 2 }}>
              {kredit.debt.note}
            </AppText>
          </View>
        </View>
      }>
      <Tap accessibilityRole="button" accessibilityLabel={tamamla.alt} onPress={() => router.push('/kredit/tamamla')}>
        <Image source={img.bannerAkart} style={{ width: '100%', aspectRatio: 390 / 138, borderRadius: radius.lg }} contentFit="cover" />
      </Tap>

      {kredit.products.map((p) => (
        <Tap
          key={p.id}
          haptic={false}
          pressScale={0.99}
          accessibilityRole="button"
          accessibilityLabel={`${p.name}. ${p.subtitle}`}
          onPress={() => (p.href ? router.push(p.href) : toast(p.note ?? `${p.name} is not part of this prototype yet`))}
          style={{ marginTop: 12 }}>
          <Card>
            <View style={styles.between}>
              <View style={{ flex: 1 }}>
                <AppText variant="subheading" style={styles.cardTitle}>
                  {p.name}
                </AppText>
                <AppText variant="caption" tone="secondary" style={{ marginTop: 4 }}>
                  {p.subtitle}
                </AppText>
                <Pill
                  tone="outline"
                  label={p.chip}
                  style={{ marginTop: 10 }}
                  icon={
                    p.chipIcon === 'coins' ? (
                      <Coins size={14} color={colors.accentIcon} />
                    ) : (
                      <Broadcast size={14} color={colors.accentIcon} />
                    )
                  }
                />
              </View>
              {p.price ? (
                <AppText variant="title" style={[tabular, { fontSize: 20, marginLeft: 12 }]}>
                  {p.price}
                </AppText>
              ) : null}
            </View>
          </Card>
        </Tap>
      ))}
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  between: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  cardTitle: { fontFamily: font.regular },
});
