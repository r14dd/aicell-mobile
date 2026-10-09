import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { errorMessage, longDate, newIdempotencyKey } from '@/api/client';
import { invalidate, useQuery } from '@/api/query';
import { acceptOffer, declineOffer, getRecommendations, RECOMMENDATIONS_KEY } from '@/api/usage';
import { NavHeader } from '@/components/NavHeader';
import { Screen } from '@/components/Screen';
import { useToast } from '@/components/Toast';
import { AppText, tabular } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAccount } from '@/state/account';
import { colors, radius } from '@/theme/tokens';

/** A personal offer from `usage/recommendations/`: the pack at its offer price, accept or decline. */
export default function OfferScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const { applyMoney } = useAccount();
  const { data, stale } = useQuery(RECOMMENDATIONS_KEY, getRecommendations);
  const offer = data?.offer && String(data.offer.id) === id ? data.offer : null;
  const [busy, setBusy] = useState(false);
  // One key per visit: a retry of the same attempt must not buy twice.
  const [key] = useState(newIdempotencyKey);

  const leave = () => {
    invalidate('usage/');
    invalidate('insights/');
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  const accept = async () => {
    if (!offer || busy) return;
    setBusy(true);
    try {
      const res = await acceptOffer(offer.id, key);
      if (typeof res.balance === 'string') applyMoney({ balance: res.balance, transaction: res.transaction });
      toast(`${offer.title} activated for ${offer.offer_price} ₼`);
      leave();
    } catch (e) {
      toast(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const decline = async () => {
    if (!offer || busy) return;
    setBusy(true);
    try {
      await declineOffer(offer.id);
      toast('Offer declined');
      leave();
    } catch (e) {
      toast(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen
      footer={
        offer ? (
          <View style={{ gap: 10 }}>
            <Button label={`Activate for ${offer.offer_price} ₼`} variant="gradient" size="lg" disabled={busy} onPress={() => void accept()} />
            <Button label="No, thanks" variant="outline" size="lg" disabled={busy} onPress={() => void decline()} />
          </View>
        ) : undefined
      }>
      <NavHeader title="Personal offer" subtitle={null} />
      {offer ? (
        <Card style={{ marginTop: 8, padding: 20 }}>
          <AppText variant="heading" style={{ fontSize: 22, lineHeight: 28 }}>
            {offer.title}
          </AppText>
          <AppText variant="body" tone="secondary" style={{ marginTop: 10 }}>
            {offer.reason}
          </AppText>
          <View style={styles.prices}>
            <AppText variant="title" style={[{ fontSize: 34, lineHeight: 40 }, tabular]}>
              {offer.offer_price}
              <AppText variant="body"> ₼</AppText>
            </AppText>
            <AppText variant="body" tone="secondary" style={[styles.was, tabular]}>
              {offer.normal_price} ₼
            </AppText>
          </View>
          <View style={styles.until}>
            <AppText variant="caption" tone="secondary">
              Valid until {longDate(offer.expires_at)}
            </AppText>
          </View>
        </Card>
      ) : (
        <AppText variant="body" tone="secondary" style={{ marginTop: 32, textAlign: 'center' }}>
          {stale ? 'Loading your offer…' : 'This offer is no longer available'}
        </AppText>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  prices: { flexDirection: 'row', alignItems: 'flex-end', gap: 12, marginTop: 22 },
  was: { textDecorationLine: 'line-through', marginBottom: 6 },
  until: { marginTop: 18, alignSelf: 'flex-start', backgroundColor: colors.cardRaised, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 6 },
});
