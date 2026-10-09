import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Linking, ScrollView, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HelpCard } from '@/components/HelpCard';
import { CaretLeft } from '@/components/icons';
import { useToast } from '@/components/Toast';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Tap } from '@/components/ui/Tap';
import { getTamamla } from '@/api/kredit';
import { useQuery } from '@/api/query';
import { tamamlaSeed } from '@/data/kredit';
import { colors, layout } from '@/theme/tokens';

// Pixel size of assets/images/ref/tamamla-hero.png.
const HERO_W = 576;
const HERO_H = 356;

export default function TamamlaScreen() {
  const router = useRouter();
  const toast = useToast();
  const { data = tamamlaSeed } = useQuery('kredit/tamamla/', getTamamla, tamamlaSeed);
  const insets = useSafeAreaInsets();
  const W = Math.min(useWindowDimensions().width, layout.maxWidth);

  const openAkart = async () => {
    try {
      await Linking.openURL(data.cta.url);
    } catch {
      toast('The akart app link could not be opened');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View>
          <Image
            source={require('@/assets/images/ref/tamamla-hero.png')}
            style={{ width: W, height: Math.round((W * HERO_H) / HERO_W) }}
            contentFit="cover"
            accessibilityLabel="Tamamla: Instant credit to akart!"
          />
          <LinearGradient
            pointerEvents="none"
            colors={['rgba(0,0,0,0.55)', 'transparent']}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 90 }}
          />
        </View>

        <View style={{ paddingHorizontal: layout.gutter, paddingTop: 20 }}>
          <Card>
            <AppText variant="bodySemibold" style={{ fontSize: 17 }}>
              How to get Tamamla?
            </AppText>
            {data.steps.map((step, i) => (
              <View key={step} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 18 }}>
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: colors.accent,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <AppText variant="bodySemibold">{i + 1}</AppText>
                </View>
                <AppText variant="body" style={{ fontSize: 15, lineHeight: 21, flex: 1 }}>
                  {step}
                </AppText>
              </View>
            ))}
          </Card>
          <View style={{ marginTop: 16 }}>
            <HelpCard />
          </View>
        </View>
      </ScrollView>

      <Tap
        hitSlop={12}
        haptic={false}
        accessibilityRole="button"
        accessibilityLabel="Back"
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        style={{ position: 'absolute', top: Math.max(insets.top, 14) + 6, left: 16 }}>
        <CaretLeft size={26} color={colors.text} />
      </Tap>

      <View style={{ paddingHorizontal: layout.gutter, paddingTop: 8, paddingBottom: Math.max(insets.bottom, 16) }}>
        <Button
          variant="gradient"
          size="lg"
          label={data.cta.label}
          onPress={openAkart}
        />
      </View>
    </View>
  );
}
