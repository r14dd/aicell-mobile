import { Image } from 'expo-image';
import { useRouter, type Href } from 'expo-router';
import { View, useWindowDimensions } from 'react-native';

import { BannerCarousel } from '@/components/BannerCarousel';
import { GradientScreen } from '@/components/GradientScreen';
import { Fire } from '@/components/icons';
import { LotteryBanner } from '@/components/LotteryBanner';
import { useToast } from '@/components/Toast';
import { TopBar } from '@/components/TopBar';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { Pill } from '@/components/ui/Pill';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { Tap } from '@/components/ui/Tap';
import { useQuery } from '@/api/query';
import { getCampaigns, getPartnerBanners, type Campaign } from '@/api/offers';
import { img } from '@/data/assets';
import { campaigns, partnerPerks } from '@/data/mock';
import { colors, font, layout, radius } from '@/theme/tokens';

const seedCampaigns: Campaign[] = campaigns;

export default function BenefitsScreen() {
  const router = useRouter();
  const toast = useToast();
  const { data: perks = partnerPerks } = useQuery('content/banners/?placement=partners', getPartnerBanners, partnerPerks);
  const { data: campaignList = seedCampaigns } = useQuery('content/campaigns/', getCampaigns, seedCampaigns);
  const { width } = useWindowDimensions();
  const W = Math.min(width, layout.maxWidth);
  const heroH = Math.round((W * 255) / 610);
  const pillW = Math.round(W * 0.68);

  return (
    <GradientScreen
      pinned={<TopBar />}
      header={
        <>
          <View style={{ marginTop: 8, marginBottom: -36 }}>
            <Image source={img.wheelHero} style={{ width: W, height: heroH }} contentFit="cover" />
            <Tap
              accessibilityRole="button"
              accessibilityLabel="Spin the wheel now"
              onPress={() => toast('Spinning the Gift Wheel is not part of this prototype yet')}
              style={{
                position: 'absolute',
                left: Math.round((W - pillW) / 2),
                top: heroH - 64,
                width: pillW,
                height: 54,
                paddingHorizontal: 34,
                borderRadius: radius.pill,
                backgroundColor: 'rgba(255,255,255,0.4)',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <AppText variant="bodySemibold" style={{ fontSize: 18 }}>
                Spin the wheel now
              </AppText>
            </Tap>
          </View>
        </>
      }>
      <LotteryBanner />

      <SectionTitle
        title="Partners perks"
        trailing={
          <Pill
            tone="outline"
            label="NEW"
            icon={<Fire size={14} color={colors.orange} weight="fill" />}
            style={{ borderColor: colors.lineStrong }}
          />
        }
      />
      <BannerCarousel items={perks} aspect={2.89} />

      <SectionTitle title="Campaigns" />
      {campaignList.map((c) => (
        <Tap
          key={c.id}
          pressScale={0.99}
          accessibilityRole="button"
          accessibilityLabel={c.title}
          onPress={() => (c.href ? router.push(c.href as Href) : toast('Campaign details are not part of this prototype yet'))}>
          <Card padded={false} style={{ flexDirection: 'row', alignItems: 'center', minHeight: 118 }}>
            <View style={{ flex: 1, padding: 20 }}>
              <AppText style={{ fontFamily: font.regular, fontSize: 19, lineHeight: 25 }}>{c.title}</AppText>
            </View>
            <Image source={c.image} style={{ width: 150, height: 118 }} contentFit="cover" />
          </Card>
        </Tap>
      ))}
    </GradientScreen>
  );
}
