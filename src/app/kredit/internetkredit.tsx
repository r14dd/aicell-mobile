import { useState } from 'react';
import { View } from 'react-native';

import { CollapsingScreen } from '@/components/CollapsingScreen';
import { HelpCard } from '@/components/HelpCard';
import { useToast } from '@/components/Toast';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { errorMessage } from '@/api/client';
import { getKredit, getKreditProduct, takeKredit } from '@/api/kredit';
import { invalidate, useQuery } from '@/api/query';
import { kreditDetailSeeds, kreditSeed } from '@/data/kredit';
import { money } from '@/data/mock';
import { useAccount } from '@/state/account';
import { colors, font } from '@/theme/tokens';

export default function InternetKreditScreen() {
  const toast = useToast();
  const { refresh } = useAccount();
  const { data: detail = kreditDetailSeeds.internetkredit } = useQuery('kredit/products/internetkredit/', () => getKreditProduct('internetkredit'), kreditDetailSeeds.internetkredit);
  const { data: list = kreditSeed } = useQuery('kredit/', getKredit, kreditSeed);
  const [busy, setBusy] = useState(false);

  const take = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await takeKredit('internetkredit', detail.amount);
      void refresh();
      invalidate('kredit/');
      toast(`${detail.name} ${money(detail.amount)} ₼ added to your balance`);
    } catch (e) {
      // 501 not_implemented carries the text to show in `detail`.
      toast(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <CollapsingScreen
      title={detail.name}
      subtitle={list.products.find((p) => p.id === 'internetkredit')?.subtitle}
      backgroundColor="#231C2E"
      footer={
        <Button
          variant="gradient"
          size="lg"
          label={detail.cta}
          disabled={busy}
          onPress={() => void take()}
        />
      }>
      <View style={{ alignItems: 'center' }}>
        <AppText variant="caption" tone="secondary">
          {`${detail.name} / ${detail.validityDays} days`}
        </AppText>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 16 }}>
          <AppText style={{ fontFamily: font.regular, fontSize: 52, lineHeight: 58, color: colors.text }}>{detail.amountMb}</AppText>
          <AppText style={{ fontFamily: font.regular, fontSize: 32, lineHeight: 38, color: colors.text }}>MB</AppText>
        </View>
        <AppText variant="caption" tone="secondary" style={{ marginTop: 6 }}>
          {`Price: ${money(detail.amount)} ₼`}
        </AppText>
      </View>
      <View style={{ marginTop: 20 }}>
        <HelpCard color={colors.cardRaised} />
      </View>
      <View style={{ height: 220 }} />
    </CollapsingScreen>
  );
}
