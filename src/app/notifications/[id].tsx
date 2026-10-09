import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CaretLeft } from '@/components/icons';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Tap } from '@/components/ui/Tap';
import { getNotification, toNotification } from '@/api/content';
import { useQuery } from '@/api/query';
import { notifications, surface } from '@/data/notifications';
import { colors, font, headerGradient } from '@/theme/tokens';

export default function NotificationDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const seed = notifications.find((n) => n.id === id);
  const remote = useQuery(id ? `content/notifications/${id}/` : null, () => getNotification(String(id))).data;
  const item = remote ? toNotification(remote) : (seed ?? notifications[0]);

  return (
    <View style={{ flex: 1, backgroundColor: surface }}>
      <LinearGradient
        colors={headerGradient}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={{ paddingTop: Math.max(insets.top, 14) + 16, paddingHorizontal: 20, paddingBottom: 42 }}>
        <Tap
          hitSlop={12}
          haptic={false}
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          style={{ height: 44, justifyContent: 'center', alignSelf: 'flex-start' }}>
          <CaretLeft size={24} color={colors.text} />
        </Tap>
        <AppText
          numberOfLines={2}
          ellipsizeMode="tail"
          style={{ fontFamily: font.bold, fontSize: 26, lineHeight: 32, color: colors.text, marginTop: 20 }}>
          {item.title}
        </AppText>
      </LinearGradient>

      <View
        style={{
          flex: 1,
          backgroundColor: surface,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          marginTop: -20,
          paddingHorizontal: 20,
          paddingTop: 18,
        }}>
        <AppText variant="caption" tone="secondary" style={{ fontSize: 14 }}>
          {item.date}
        </AppText>
        <AppText variant="body" style={{ fontSize: 17, lineHeight: 22, marginTop: 14 }}>
          {item.body}
        </AppText>
      </View>

      {item.cta ? (
        <View style={{ paddingHorizontal: 20, paddingBottom: Math.max(insets.bottom, 16) }}>
          <Button label={item.cta} variant="gradient" size="lg" onPress={() => (item.ctaHref ? router.push(item.ctaHref as Href) : router.back())} />
        </View>
      ) : null}
    </View>
  );
}
