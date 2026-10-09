import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ArrowCounterClockwise, Broadcast, Fire, SimCard } from '@/components/icons';
import { NavHeader } from '@/components/NavHeader';
import { PackAppIcon } from '@/components/PackAppIcon';
import { Sheet } from '@/components/Sheet';
import { useToast } from '@/components/Toast';
import { AppText, tabular } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Divider } from '@/components/ui/Divider';
import { Pill } from '@/components/ui/Pill';
import { Tap } from '@/components/ui/Tap';
import { getInternetPacks, purchasePack } from '@/api/packs';
import { errorMessage } from '@/api/client';
import { useQuery } from '@/api/query';
import { internetPacksSeed, type InternetPack, type PackCategoryId, type SocialPack } from '@/data/internetPacks';
import { money } from '@/data/mock';
import { tariffSurface } from '@/data/myTariff';
import { confirmPurchase } from '@/laya/identity';
import { LayaSpot } from '@/laya/LayaSpot';
import { setLayaUi, signal } from '@/laya/store';
import { useAccount } from '@/state/account';
import { formatNumber, useSession } from '@/state/session';
import { colors, font, headerGradient, layout, radius } from '@/theme/tokens';

export default function InternetPacksScreen() {
  const { account } = useSession();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const toast = useToast();
  const { applyMoney } = useAccount();
  const { data = internetPacksSeed } = useQuery('packs/internet/', getInternetPacks, internetPacksSeed);
  const [category, setCategory] = useState<PackCategoryId>('unlimited');
  const [busy, setBusy] = useState(false);
  // The sheet keeps showing its pack while it slides out, so open and pack are separate.
  const [pack, setPack] = useState<InternetPack | null>(null);
  const [open, setOpen] = useState(false);
  const page = useRef<ScrollView>(null);
  const chips = useRef<ScrollView>(null);

  const buy = (p: InternetPack) => {
    setPack(p);
    setOpen(true);
  };

  const showUnlimited = () => {
    setCategory('unlimited');
    page.current?.scrollTo({ y: 0, animated: true });
    chips.current?.scrollTo({ x: 0, animated: true });
  };

  const confirm = async () => {
    if (!pack || busy) return;
    setBusy(true);
    try {
      if (!(await confirmPurchase(`Pay ${money(pack.price)} ₼`))) {
        signal('authFailed');
        return;
      }
      const res = await purchasePack(pack.id);
      applyMoney(res);
      toast(`${pack.label} activated for ${money(pack.price)} ₼`);
      signal('paid');
    } catch (e) {
      // 402 carries the "not enough balance" text in `detail`.
      toast(errorMessage(e));
      setLayaUi({ error: errorMessage(e) });
      signal('failed');
    } finally {
      setOpen(false);
      setBusy(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <LinearGradient
        colors={headerGradient}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={{ paddingTop: Math.max(insets.top, 14), paddingBottom: 22 }}>
        <View style={{ paddingHorizontal: layout.gutter }}>
          <NavHeader title="Internet packs" subtitle={null} />
        </View>
        <Tap pressScale={0.99} accessibilityRole="button" accessibilityLabel="Unlimited packs" onPress={showUnlimited} style={styles.promoTap}>
          <LinearGradient colors={data.promo.gradient} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.promo}>
            <AppText variant="bodySemibold" style={{ fontSize: 18, lineHeight: 25 }}>
              {data.promo.title}
            </AppText>
            <AppText variant="caption" style={{ color: 'rgba(255,255,255,0.85)', marginTop: 8, fontSize: 14 }}>
              {data.promo.sub}
            </AppText>
          </LinearGradient>
        </Tap>
      </LinearGradient>

      <ScrollView ref={page} style={styles.body} contentContainerStyle={{ paddingBottom: insets.bottom + 32 }} showsVerticalScrollIndicator={false}>
        <ScrollView
          ref={chips}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: layout.gutter, gap: 10, paddingVertical: 14 }}>
          {data.categories.map((c) => {
            const selected = c.id === category;
            return (
              <LayaSpot key={c.id} id={`packs.tab.${c.id}`} press={() => setCategory(c.id)}>
                <Tap
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => setCategory(c.id)}
                  style={[styles.chip, selected ? { backgroundColor: colors.accent } : styles.chipOff]}>
                  <AppText style={{ fontFamily: font.regular, fontSize: 16, lineHeight: 22 }}>{c.label}</AppText>
                </Tap>
              </LayaSpot>
            );
          })}
        </ScrollView>

        {category === 'social' ? (
          <View style={styles.list}>
            {data.social.map((s) => {
              const open = () => router.push({ pathname: '/internet-packs/[id]', params: { id: s.id } });
              return (
                <LayaSpot key={s.id} id={`packs.card.${s.id}`} press={open}>
                  <SocialCard item={s} onPress={open} />
                </LayaSpot>
              );
            })}
          </View>
        ) : (
          <View style={styles.list}>
            <Card color={tariffSurface} padded={false}>
              {(data.packsByCategory[category] ?? []).map((p, i) => (
                <View key={p.id}>
                  {i > 0 ? <Divider style={{ marginHorizontal: 16 }} /> : null}
                  <View style={styles.packRow}>
                    <View style={{ flex: 1 }}>
                      <AppText style={{ fontSize: 18, lineHeight: 24 }}>{p.name}</AppText>
                      <View style={styles.sub}>
                        {p.renews ? <ArrowCounterClockwise size={14} color={colors.textSecondary} /> : null}
                        <AppText variant="caption" tone="secondary">
                          {p.sub}
                        </AppText>
                      </View>
                    </View>
                    <LayaSpot id={`packs.buy.${p.id}`} press={() => buy(p)}>
                      <Button variant="gradient" size="sm" label={`Buy ${money(p.price)} ₼`} onPress={() => buy(p)} />
                    </LayaSpot>
                  </View>
                </View>
              ))}
            </Card>
          </View>
        )}
      </ScrollView>

      <Sheet visible={open} onClose={() => setOpen(false)} title="Confirm your payment">
        {pack ? (
          <>
            <AppText variant="bodySemibold" style={{ fontSize: 16, marginTop: 8 }}>
              Selected item
            </AppText>
            <View style={[styles.box, styles.itemBox]}>
              <AppText style={{ fontSize: 16 }}>{pack.label}</AppText>
              <AppText variant="title" style={[{ fontSize: 24, lineHeight: 30 }, tabular]}>
                {money(pack.price)}
                <AppText variant="small"> ₼</AppText>
              </AppText>
            </View>
            <View style={[styles.box, styles.numberBox]}>
              <View style={styles.sim}>
                <SimCard size={18} color={colors.text} weight="fill" />
              </View>
              <View>
                <AppText variant="caption" tone="secondary">
                  For number:
                </AppText>
                <AppText style={{ fontSize: 16 }}>{data.msisdn ? formatNumber(data.msisdn) : account.number}</AppText>
              </View>
            </View>
            <LayaSpot id="packs.confirm" press={() => void confirm()} style={{ marginTop: 36 }}>
              <Button variant="gradient" size="lg" label="Confirm" disabled={busy} onPress={() => void confirm()} />
            </LayaSpot>
          </>
        ) : null}
      </Sheet>
    </View>
  );
}

function SocialCard({ item, onPress }: { item: SocialPack; onPress: () => void }) {
  return (
    <Tap pressScale={0.99} accessibilityRole="button" accessibilityLabel={item.title} onPress={onPress}>
      <Card color={tariffSurface} padded={false}>
        {item.special ? (
          <LinearGradient colors={['#456FE1', '#8E80FF']} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.strip}>
            <Fire size={15} color={colors.text} weight="regular" />
            <AppText variant="captionMedium" style={{ fontSize: 14 }}>
              Special for İstəSən
            </AppText>
          </LinearGradient>
        ) : null}
        <View style={styles.offer}>
          <View style={styles.offerHead}>
            <AppText style={{ flex: 1, fontSize: 18, lineHeight: 24 }}>{item.title}</AppText>
            <AppText variant="title" style={[{ fontSize: 24, lineHeight: 30 }, tabular]}>
              {item.range}
              <AppText variant="small"> ₼</AppText>
            </AppText>
          </View>
          <AppText variant="small" tone="secondary" style={{ marginTop: 2 }}>
            {item.subtitle}
          </AppText>
          <View style={styles.chipsRow}>
            <PackAppIcon app={item.app} size={26} />
            <Pill label={item.volume} icon={<Broadcast size={13} color={colors.accentIcon} />} />
            {item.periods.map((p) => (
              <Pill key={p} label={p} />
            ))}
          </View>
        </View>
      </Card>
    </Tap>
  );
}

const styles = StyleSheet.create({
  promoTap: { marginHorizontal: layout.gutter, marginTop: 2, marginBottom: 20 },
  promo: { borderRadius: 16, padding: 18 },
  // Black body that overlaps the header gradient so its rounded top shows the gradient.
  body: { flex: 1, marginTop: -22, borderTopLeftRadius: 22, borderTopRightRadius: 22, backgroundColor: colors.bg, overflow: 'hidden' },
  chip: { height: 46, paddingHorizontal: 22, borderRadius: radius.pill, justifyContent: 'center' },
  chipOff: { borderWidth: 1, borderColor: colors.accent },
  list: { paddingHorizontal: layout.gutter, gap: 10 },
  packRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingHorizontal: 16, paddingVertical: 13 },
  sub: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  strip: { height: 35, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  offer: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 14 },
  offerHead: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginTop: 12 },
  box: { marginTop: 16, borderRadius: radius.lg, paddingHorizontal: 16, minHeight: 68, flexDirection: 'row', alignItems: 'center' },
  itemBox: { marginTop: 26, justifyContent: 'space-between', borderWidth: 1, borderColor: colors.accentIcon },
  numberBox: { gap: 12, backgroundColor: colors.cardRaised },
  sim: { width: 40, height: 30, borderRadius: 8, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
});
