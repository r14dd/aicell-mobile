import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { getBanners } from '@/api/content';
import { useQuery } from '@/api/query';
import { getHotTariffs, tariffPath, toBanners, toHotTariffs } from '@/api/tariffs';
import { BannerCarousel } from '@/components/BannerCarousel';
import { GradientScreen } from '@/components/GradientScreen';
import {
  ArrowCounterClockwise,
  Broadcast,
  CellSignalFull,
  ChatText,
  Cpu,
  FacebookLogo,
  InstagramLogo,
  Notebook,
  Phone,
  SquaresFour,
  Star,
  TelegramLogo,
  TiktokLogo,
  WhatsappLogo,
  WifiHigh,
} from '@/components/icons';
import { useToast } from '@/components/Toast';
import { TopBar } from '@/components/TopBar';
import { AppText, tabular } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Divider } from '@/components/ui/Divider';
import { Pill } from '@/components/ui/Pill';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { Tap } from '@/components/ui/Tap';
import { img } from '@/data/assets';
import { aztelekom, appOffers, money, productBanners, topInternetPacks, type Social, type TariffOffer } from '@/data/mock';
import { hotTariffSeed } from '@/data/tariffs';
import { colors, font, layout } from '@/theme/tokens';

const categories: { key: string; label: string; icon: ReactNode }[] = [
  { key: 'internet', label: 'Internet', icon: <Broadcast size={30} color={colors.text} weight="light" /> },
  { key: 'tariffs', label: 'Tariffs', icon: <Notebook size={30} color={colors.text} weight="light" /> },
  { key: 'roaming', label: 'Roaming', icon: <CellSignalFull size={30} color={colors.text} weight="light" /> },
  { key: 'esim', label: 'eSIM', icon: <Cpu size={30} color={colors.text} weight="light" /> },
  { key: 'apps', label: 'Apps', icon: <SquaresFour size={30} color={colors.text} weight="light" /> },
];

const socials: Record<Social, { color: string; icon: ReactNode }> = {
  whatsapp: { color: '#25D366', icon: <WhatsappLogo size={15} color={colors.text} weight="fill" /> },
  telegram: { color: '#2AABEE', icon: <TelegramLogo size={15} color={colors.text} weight="fill" /> },
  instagram: { color: '#E1306C', icon: <InstagramLogo size={15} color={colors.text} weight="fill" /> },
  facebook: { color: '#1877F2', icon: <FacebookLogo size={15} color={colors.text} weight="fill" /> },
  tiktok: { color: '#111111', icon: <TiktokLogo size={15} color={colors.text} weight="fill" /> },
};

const featureIcons: Record<TariffOffer['features'][number]['kind'], ReactNode> = {
  data: <Broadcast size={14} color={colors.accentIcon} weight="regular" />,
  minutes: <Phone size={14} color={colors.accentIcon} weight="regular" />,
  sms: <ChatText size={14} color={colors.accentIcon} weight="regular" />,
  roaming: <CellSignalFull size={14} color={colors.accentIcon} weight="regular" />,
};

export default function ProductsScreen() {
  const toast = useToast();
  const router = useRouter();
  const { data: banners = productBanners } = useQuery('content/banners/?placement=products', () => getBanners('products').then(toBanners), productBanners);
  const { data: hot = hotTariffSeed } = useQuery(tariffPath.hot, () => getHotTariffs().then(toHotTariffs), hotTariffSeed);

  return (
    <GradientScreen
      pinned={<TopBar />}
      header={
        <>
          <View style={{ paddingHorizontal: layout.gutter, marginTop: 12 }}>
            <BannerCarousel items={banners} aspect={3.05} />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 22, gap: 22, paddingTop: 14 }}>
            {categories.map((c) => (
              <Tap
                key={c.key}
                accessibilityRole="button"
                accessibilityLabel={c.label}
                onPress={() => toast(`${c.label} catalogue is not part of this prototype yet`)}
                style={styles.chip}>
                <View style={styles.chipBox}>{c.icon}</View>
                <AppText variant="small" style={styles.chipLabel}>
                  {c.label}
                </AppText>
              </Tap>
            ))}
          </ScrollView>
        </>
      }>
      {/* Home internet */}
      <SectionTitle title="Home internet" first />
      <Tap
        pressScale={0.99}
        accessibilityRole="button"
        accessibilityLabel="Aztelekom Home internet"
        onPress={() => toast('Aztelekom home internet is not part of this prototype yet')}>
        <Card color={colors.cardIndigo}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <AppText variant="subheading">Aztelekom Home internet</AppText>
              <AppText variant="caption" tone="onHeaderSecondary" style={{ fontSize: 15, marginTop: 6 }}>
                Optical internet with speed up to 100 Mbps
              </AppText>
            </View>
            <Image source={img.house} style={{ width: 96, height: 88 }} contentFit="contain" />
          </View>
        </Card>
      </Tap>

      {/* TOP internet packs */}
      <SectionTitle
        title="TOP internet packs"
        action="See all"
        onAction={() => toast('The full internet pack list is not part of this prototype yet')}
      />
      <Card padded={false} style={{ paddingHorizontal: 20 }}>
        {topInternetPacks.map((p, i) => (
          <View key={p.id}>
            {i > 0 ? <Divider /> : null}
            <View style={[styles.between, { paddingVertical: 16 }]}>
              <View style={{ flex: 1 }}>
                <AppText style={styles.packTitle}>{p.title}</AppText>
                <View style={[styles.row, { marginTop: 4, gap: 6 }]}>
                  {p.renews ? <ArrowCounterClockwise size={14} color={colors.textSecondary} /> : null}
                  <AppText variant="caption" tone="secondary">
                    {p.subtitle}
                  </AppText>
                </View>
              </View>
              <Button
                size="sm"
                label={`Buy ${money(p.price)} ₼`}
                onPress={() => toast('Pack purchase is not part of this prototype yet')}
              />
            </View>
          </View>
        ))}
      </Card>

      {/* Hot offers on tariffs */}
      <SectionTitle
        title="Hot offers on tariffs"
        action="See all"
        onAction={() => toast('The full tariff list is not part of this prototype yet')}
      />
      <View style={{ gap: 12 }}>
        {hot.map((t) => (
          <Tap
            key={t.id}
            pressScale={0.99}
            accessibilityRole="button"
            accessibilityLabel={t.name}
            onPress={() => router.push({ pathname: '/tariffs/[id]', params: { id: t.familyId, plan: t.id } })}>
            <Card>
              <View style={styles.between}>
                <AppText variant="heading" style={styles.tariffName}>
                  {t.name}
                </AppText>
                <AppText variant="title" style={tabular}>
                  {t.price}
                  <AppText variant="bodyMedium" style={{ fontSize: 15 }}>
                    {' '}₼
                  </AppText>
                </AppText>
              </View>
              <View style={[styles.row, { marginTop: 4, gap: 6 }]}>
                {t.period ? (
                  <>
                    <ArrowCounterClockwise size={14} color={colors.textSecondary} />
                    <AppText variant="caption" tone="secondary">
                      {t.period}
                    </AppText>
                  </>
                ) : t.tagline ? (
                  <>
                    <Star size={14} color={colors.accentIcon} weight="fill" />
                    <AppText variant="caption" tone="secondary">
                      {t.tagline}
                    </AppText>
                  </>
                ) : null}
              </View>
              <View style={[styles.row, { marginTop: 12, flexWrap: 'wrap', gap: 8 }]}>
                <View style={[styles.row, { marginRight: 4 }]}>
                  {t.socials.map((s, i) => (
                    <View key={s} style={[styles.social, { backgroundColor: socials[s].color }, i > 0 && { marginLeft: -7 }]}>
                      {socials[s].icon}
                    </View>
                  ))}
                </View>
                {t.features.map((f) => (
                  <Pill key={f.label} tone="outline" label={f.label} icon={featureIcons[f.kind]} />
                ))}
              </View>
            </Card>
          </Tap>
        ))}
      </View>

      {/* Apps */}
      <SectionTitle
        title="Apps"
        action="See all"
        onAction={() => toast('The full app catalogue is not part of this prototype yet')}
      />
      <Card padded={false} style={{ paddingHorizontal: 20 }}>
        {appOffers.map((a, i) => (
          <View key={a.id}>
            {i > 0 ? <Divider /> : null}
            <Tap
              pressScale={0.99}
              haptic={false}
              accessibilityRole="button"
              accessibilityLabel={a.name}
              onPress={() => toast(`${a.name} is not part of this prototype yet`)}
              style={[styles.row, { paddingVertical: 14, gap: 14 }]}>
              <View style={[styles.monogram, { backgroundColor: a.color }]}>
                <AppText variant="bodySemibold">{a.monogram}</AppText>
              </View>
              <View style={{ flex: 1 }}>
                <AppText variant="body" style={{ fontSize: 17 }}>
                  {a.name}
                </AppText>
                <AppText variant="small" tone="secondary">
                  {a.description}
                </AppText>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <AppText variant="small" tone="secondary">
                  From
                </AppText>
                <AppText variant="bodyMedium" style={tabular}>
                  {money(a.from)} ₼
                </AppText>
              </View>
            </Tap>
          </View>
        ))}
      </Card>

      {/* Aztelekom */}
      <SectionTitle
        title="Aztelekom"
        action="See all"
        onAction={() => toast('The Aztelekom catalogue is not part of this prototype yet')}
      />
      <Tap
        pressScale={0.99}
        accessibilityRole="button"
        accessibilityLabel={aztelekom.title}
        onPress={() => toast('Aztelekom Fiber Optical is not part of this prototype yet')}>
        <Card>
          <View style={styles.between}>
            <AppText variant="heading" style={styles.tariffName}>
              {aztelekom.title}
            </AppText>
            <AppText variant="title" style={[tabular, { fontSize: 22 }]}>
              {aztelekom.price}
            </AppText>
          </View>
          <View style={[styles.row, { marginTop: 12, flexWrap: 'wrap', gap: 8 }]}>
            <Pill tone="outline" label={aztelekom.bundle} icon={<WifiHigh size={14} color={colors.accentIcon} />} />
            <Pill tone="outline" label={aztelekom.speed} icon={<CellSignalFull size={14} color={colors.accentIcon} />} />
          </View>
        </Card>
      </Tap>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  chip: { alignItems: 'center' },
  chipBox: {
    width: 80,
    height: 80,
    borderRadius: 22,
    backgroundColor: colors.glass,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipLabel: { fontSize: 15, marginTop: 8 },
  packTitle: { fontFamily: font.regular, fontSize: 22, lineHeight: 28 },
  tariffName: { fontFamily: font.medium, fontSize: 20 },
  social: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monogram: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
