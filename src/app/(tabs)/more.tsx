import { ImageBackground } from 'expo-image';
import { useRouter, type Href } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { useWindowDimensions, View } from 'react-native';

import { GradientScreen } from '@/components/GradientScreen';
import { Sheet } from '@/components/Sheet';
import {
  CaretRight,
  FingerprintSimple,
  Flag,
  Gear,
  Gift,
  Headset,
  Info,
  MapPin,
  SignOut,
  SimCard,
  Star,
  Sticker,
  User,
} from '@/components/icons';
import { useRateApp } from '@/components/RateApp';
import { useToast } from '@/components/Toast';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { ListRow } from '@/components/ui/ListRow';
import { Tap } from '@/components/ui/Tap';
import { img } from '@/data/assets';
import { subscriber } from '@/data/mock';
import { useSession } from '@/state/session';
import { colors, font, layout, radius } from '@/theme/tokens';

type Row = { icon: typeof User; label: string; href?: Href; note?: string; action?: 'rate' };

const groups: { title: string; rows: Row[] }[] = [
  {
    title: 'Services',
    rows: [
      { icon: FingerprintSimple, label: 'Asan Imza', note: 'Asan Imza is not part of this prototype yet' },
      { icon: Gift, label: 'Invite your friend and earn', href: '/invite' },
    ],
  },
  {
    title: 'Settings',
    rows: [
      { icon: SimCard, label: 'SIM settings', note: 'SIM settings are not part of this prototype yet' },
      { icon: Gear, label: 'App settings', note: 'App settings are not part of this prototype yet' },
    ],
  },
  {
    title: 'Contact',
    rows: [
      { icon: Headset, label: 'Help & Support', note: 'Help & Support is not part of this prototype yet' },
      { icon: Flag, label: 'Report a problem', note: 'Reporting a problem is not part of this prototype yet' },
    ],
  },
  {
    title: 'General',
    rows: [
      { icon: MapPin, label: 'Map', note: 'The map is not part of this prototype yet' },
      { icon: Sticker, label: 'Stickers', note: 'Stickers are not part of this prototype yet' },
      { icon: Info, label: 'About Azercell', note: 'About Azercell is not part of this prototype yet' },
      { icon: Star, label: 'Rate the app', action: 'rate' },
    ],
  },
];

export default function MoreScreen() {
  const { account, signOut } = useSession();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const confirmLogout = () => {
    setLogoutOpen(false);
    signOut();
    router.replace('/welcome');
  };
  const router = useRouter();
  const toast = useToast();
  const openRate = useRateApp();
  const { width } = useWindowDimensions();
  const bannerWidth = Math.min(width, layout.maxWidth) - 2 * layout.gutter;

  return (
    <GradientScreen
      header={
        <Tap
          haptic={false}
          pressScale={0.99}
          accessibilityRole="button"
          accessibilityLabel={`${account.name}, profile settings`}
          onPress={() => toast('Profile settings are not part of this prototype yet')}>
          <View
            style={{
              marginHorizontal: layout.gutter,
              marginTop: 12,
              backgroundColor: colors.glass,
              borderRadius: radius.lg,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 14,
            }}>
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: '#241C3D',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <User size={30} color="#8C84A8" weight="fill" />
            </View>
            <View style={{ flex: 1 }}>
              <AppText variant="subheading">{account.name}</AppText>
              <AppText variant="caption" tone="onHeaderSecondary" style={{ marginTop: 2 }}>
                {account.number}
              </AppText>
            </View>
            <CaretRight size={20} color={colors.text} />
          </View>
        </Tap>
      }>
      <ImageBackground
        source={img.aiBanner}
        contentFit="cover"
        style={{ height: Math.round((bannerWidth * 153) / 430), borderRadius: radius.lg, overflow: 'hidden' }}>
        <View style={{ padding: 20, justifyContent: 'center', height: '100%' }}>
          <AppText style={{ fontFamily: font.medium, fontSize: 22, lineHeight: 28, color: colors.text, maxWidth: '58%' }}>
            {"Hello, I'm an AI Chat Bot!"}
          </AppText>
          <Button
            label="Chat with me"
            size="sm"
            style={{ alignSelf: 'flex-start', marginTop: 12 }}
            onPress={() => router.push('/support')}
          />
        </View>
      </ImageBackground>

      {groups.map((group) => (
        <View key={group.title}>
          <AppText variant="bodySemibold" style={{ fontSize: 17, marginTop: 24, marginBottom: 2 }}>
            {group.title}
          </AppText>
          {group.rows.map(({ icon: Icon, label, href, note, action }) => (
            <ListRow
              key={label}
              icon={<Icon size={26} color={colors.accentIcon} weight="light" />}
              label={label}
              onPress={() => (action === 'rate' ? openRate() : href ? router.push(href) : toast(note ?? label))}
            />
          ))}
        </View>
      ))}

      <Divider style={{ marginTop: 12 }} />
      <ListRow
        tone="red"
        icon={<SignOut size={26} color={colors.red} weight="light" />}
        label="Log out"
        onPress={() => setLogoutOpen(true)}
      />
      <AppText variant="caption" tone="secondary" style={{ marginTop: 12 }}>
        {subscriber.appVersion}
      </AppText>
      <Sheet visible={logoutOpen} onClose={() => setLogoutOpen(false)} centered hideClose surface="#14111B">
        <View style={{ alignItems: 'center' }}>
          <LinearGradient colors={['#7B41E8', '#9B4CE6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 70, height: 70, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}>
            <SignOut size={30} color={colors.text} weight="regular" />
          </LinearGradient>
          <AppText style={{ marginTop: 18, fontFamily: font.semibold, fontSize: 17, lineHeight: 23, color: colors.text, textAlign: 'center' }}>
            {`Log out from +994 ${account.number.replace(/^0/, '')}?`}
          </AppText>
          <Button label="Cancel" variant="outline" size="md" style={{ alignSelf: 'stretch', marginTop: 22 }} onPress={() => setLogoutOpen(false)} />
          <Button label="Log out" size="md" style={{ alignSelf: 'stretch', marginTop: 12 }} onPress={confirmLogout} />
        </View>
      </Sheet>
    </GradientScreen>
  );
}
