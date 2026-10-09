import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useQuery } from '@/api/query';
import { getServices, toService } from '@/api/sim';
import { NavHeader } from '@/components/NavHeader';
import { GradientPill } from '@/components/ui/GradientPill';
import { AppText, tabular } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { Pill } from '@/components/ui/Pill';
import { Tap } from '@/components/ui/Tap';
import { surface } from '@/data/notifications';
import { services, servicesCopy } from '@/data/simServices';
import { colors, headerGradient, layout, radius } from '@/theme/tokens';

const SHEET_RADIUS = 20;

export default function ServicesScreen() {
  const list = useQuery('sim/services/', getServices).data;
  const items = list ? list.results.map(toService) : services;
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <LinearGradient
        colors={headerGradient}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={{ paddingTop: Math.max(insets.top, 14), paddingBottom: SHEET_RADIUS + 11 }}>
        <View style={{ paddingHorizontal: layout.gutter }}>
          <NavHeader title={servicesCopy.title} subtitle={null} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.body}
        contentContainerStyle={{ paddingHorizontal: layout.gutter, paddingTop: 22, paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}>
        {items.map((s) => (
          <Tap
            key={s.id}
            onPress={() => router.push({ pathname: '/sim/services/[id]', params: { id: s.id } })}
            pressScale={0.99}
            accessibilityRole="button"
            accessibilityLabel={s.name}
            style={{ marginBottom: 18 }}>
            <Card color={surface} padded={false} style={styles.card}>
              <View style={styles.head}>
                <View style={{ flex: 1 }}>
                  <AppText variant="bodyMedium" style={{ fontSize: 17 }}>
                    {s.name}
                  </AppText>
                  <AppText variant="small" tone="secondary" style={{ marginTop: 3, fontSize: 13 }}>
                    {s.sub}
                  </AppText>
                </View>
                {s.activated ? (
                  <GradientPill label={s.badge} />
                ) : s.price !== undefined ? (
                  <View style={styles.price}>
                    <AppText variant="title" style={tabular}>
                      {s.price.toFixed(2)}
                    </AppText>
                    <AppText variant="small">{servicesCopy.priceUnit}</AppText>
                  </View>
                ) : null}
              </View>
              <Pill tone="outline" label={s.period} style={styles.period} />
            </Card>
          </Tap>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, marginTop: -SHEET_RADIUS, borderTopLeftRadius: SHEET_RADIUS, borderTopRightRadius: SHEET_RADIUS, backgroundColor: colors.bg },
  card: { borderRadius: radius.xl, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 14 },
  head: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  price: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  period: { marginTop: 14, paddingHorizontal: 12, paddingVertical: 9 },
});
