import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { errorMessage } from '@/api/client';
import { setQueryData, useQuery } from '@/api/query';
import { getRoaming, getRoamingPacks, patchRoaming, purchaseRoamingPack, toRoamingPack } from '@/api/sim';
import { CellSignalFull, MagnifyingGlass } from '@/components/icons';
import { HelpCard } from '@/components/HelpCard';
import { NavHeader } from '@/components/NavHeader';
import { Sheet } from '@/components/Sheet';
import { useToast } from '@/components/Toast';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Divider } from '@/components/ui/Divider';
import { Toggle } from '@/components/ui/Toggle';
import { money } from '@/data/mock';
import { surface } from '@/data/notifications';
import { roamingPacks, roamingText as t, type RoamingPack } from '@/data/simSettings';
import { confirmPurchase } from '@/laya/identity';
import { LayaSpot } from '@/laya/LayaSpot';
import { setLayaUi, signal } from '@/laya/store';
import { useAccount } from '@/state/account';
import { noOutline } from '@/theme/inputs';
import { colors, ctaGradient, font, headerGradient, layout } from '@/theme/tokens';

const SHEET_RADIUS = 20;
const SKELETON = '#2C2539';
const STRIP_GREEN = '#4BB509';
const STRIP_MS = 2000;

export default function RoamingScreen() {
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const { applyMoney } = useAccount();
  const top = Math.max(insets.top, 14);
  const [loading, setLoading] = useState(true);
  const roaming = useQuery('sim/roaming/', getRoaming).data;
  const packsData = useQuery('packs/roaming/', getRoamingPacks).data;
  const packs = packsData ? packsData.results.map(toRoamingPack) : roamingPacks;
  const sheet = packsData?.confirm;
  // The switch flips at once; the server's answer then replaces the cached state.
  const [pendingOn, setPendingOn] = useState<boolean | null>(null);
  const on = pendingOn ?? roaming?.enabled ?? false;
  // The strip shows the value just switched to; every switch alternates it, so the timer always restarts.
  const [strip, setStrip] = useState<boolean | null>(null);
  const [pack, setPack] = useState<RoamingPack | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (strip === null) return;
    const timer = setTimeout(() => setStrip(null), STRIP_MS);
    return () => clearTimeout(timer);
  }, [strip]);

  const change = (next: boolean) => {
    setPendingOn(next);
    setStrip(next);
    patchRoaming(next)
      .then((res) => setQueryData('sim/roaming/', res))
      .catch((e: unknown) => toast(errorMessage(e)))
      .finally(() => setPendingOn(null));
  };

  const confirm = async () => {
    if (!pack) return;
    const chosen = pack;
    try {
      if (!(await confirmPurchase(`Pay ${money(chosen.price)} ₼`))) {
        signal('authFailed');
        return;
      }
      const res = await purchaseRoamingPack(chosen.id);
      applyMoney(res);
      toast(`${chosen.name} roaming pack activated for ${money(chosen.price)} ₼`);
      signal('paid');
    } catch (e) {
      toast(errorMessage(e));
      setLayaUi({ error: errorMessage(e) });
      signal('failed');
    } finally {
      setPack(null);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <LinearGradient
        colors={headerGradient}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={{ paddingTop: top, paddingBottom: SHEET_RADIUS + 16 }}>
        <View style={{ paddingHorizontal: layout.gutter }}>
          <NavHeader title={t.title} subtitle={null} />
        </View>
        <View style={[styles.tile, loading && { backgroundColor: SKELETON }]}>
          {loading ? null : (
            <>
              <View style={[styles.badge, { backgroundColor: on ? '#B4C8FB' : '#7B7F83' }]}>
                <CellSignalFull size={22} color={on ? colors.blue : '#FFFFFF'} />
              </View>
              <AppText style={{ flex: 1, fontSize: 16, lineHeight: 22 }}>{t.title}</AppText>
              <Toggle value={on} onChange={change} accessibilityLabel={t.title} />
            </>
          )}
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.body}
        contentContainerStyle={{ paddingHorizontal: layout.gutter, paddingTop: 28, paddingBottom: 24 + insets.bottom }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <AppText variant="bodySemibold" style={{ fontSize: 16 }}>
          {roaming?.texts.search_title ?? t.searchTitle}
        </AppText>
        <View style={[styles.search, { marginTop: 8 }]}>
          {loading ? null : (
            <>
              <MagnifyingGlass size={22} color={colors.textSecondary} />
              <TextInput
                placeholder={roaming?.texts.search_placeholder ?? t.searchPlaceholder}
                placeholderTextColor={colors.textSecondary}
                selectionColor={colors.accent}
                returnKeyType="search"
                onSubmitEditing={() => toast('Country pricing is not part of this prototype yet')}
                style={{ flex: 1, fontFamily: font.regular, fontSize: 16, color: colors.text, padding: 0, ...noOutline }}
              />
            </>
          )}
        </View>

        <AppText variant="bodySemibold" style={{ fontSize: 16, marginTop: 24 }}>
          {roaming?.texts.packs_title ?? t.packsTitle}
        </AppText>
        <Card color={surface} padded={false} style={{ marginTop: 21 }}>
          {packs.map((p, i) => (
            <View key={p.id}>
              {i > 0 ? <Divider style={{ backgroundColor: colors.lineStrong }} /> : null}
              <View style={styles.packRow}>
                <View style={{ flex: 1 }}>
                  <AppText style={{ fontSize: 20, lineHeight: 26 }}>{p.name}</AppText>
                  <AppText variant="caption" tone="secondary" style={{ marginTop: 2 }}>
                    {p.sub}
                  </AppText>
                </View>
                <LayaSpot id={`roaming.pack.${p.id}`} press={() => setPack(p)}>
                  <Button variant="gradient" size="sm" label={`Buy ${money(p.price)} ₼`} onPress={() => setPack(p)} />
                </LayaSpot>
              </View>
            </View>
          ))}
        </Card>

        <View style={{ marginTop: 11 }}>
          <HelpCard />
        </View>
      </ScrollView>

      {strip !== null ? (
        <Animated.View
          pointerEvents="none"
          entering={FadeIn.duration(180)}
          exiting={FadeOut.duration(220)}
          style={[styles.strip, { top: top + 60 }]}>
          <AppText variant="caption" style={{ fontSize: 14 }}>
            {strip ? 'Roaming: ON' : 'Roaming: OFF'}
          </AppText>
        </Animated.View>
      ) : null}

      <Sheet visible={pack !== null} onClose={() => setPack(null)} centered>
        <View style={styles.sheetBody}>
          <LinearGradient colors={ctaGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.sheetIcon}>
            <CellSignalFull size={30} color="#FFFFFF" />
          </LinearGradient>
          <AppText variant="title" style={{ fontSize: 17, lineHeight: 24, letterSpacing: 0, marginTop: 14, textAlign: 'center' }}>
            {sheet?.title ?? t.sheetTitle}
          </AppText>
          <AppText variant="caption" tone="secondary" style={{ marginTop: 8, textAlign: 'center', maxWidth: 290 }}>
            {sheet?.body ?? t.sheetBody}
          </AppText>
        </View>
        <Button label={sheet?.decline ?? t.decline} variant="outline" size="lg" style={{ marginTop: 20 }} onPress={() => setPack(null)} />
        <LayaSpot id="roaming.confirm" press={() => void confirm()} style={{ marginTop: 10 }}>
          <Button label={sheet?.confirm ?? t.confirm} variant="gradient" size="lg" onPress={() => void confirm()} />
        </LayaSpot>
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    height: 72,
    marginTop: -4,
    marginHorizontal: layout.gutter,
    paddingHorizontal: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.glass,
  },
  badge: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  strip: { position: 'absolute', left: 0, right: 0, height: 32, backgroundColor: STRIP_GREEN, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, marginTop: -SHEET_RADIUS, borderTopLeftRadius: SHEET_RADIUS, borderTopRightRadius: SHEET_RADIUS, backgroundColor: colors.bg },
  search: {
    height: 46,
    borderRadius: 23,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: SKELETON,
  },
  packRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12 },
  sheetBody: { alignItems: 'center' },
  sheetIcon: { width: 60, height: 60, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
});
