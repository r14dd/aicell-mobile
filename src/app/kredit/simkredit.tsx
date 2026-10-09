import { useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { CollapsingScreen } from '@/components/CollapsingScreen';
import { HelpCard } from '@/components/HelpCard';
import { PlanChooser } from '@/components/PlanChooser';
import { useToast } from '@/components/Toast';
import { AppText } from '@/components/ui/AppText';
import { errorMessage } from '@/api/client';
import { getKredit, getKreditProduct, takeKredit } from '@/api/kredit';
import { invalidate, useQuery } from '@/api/query';
import { kreditDetailSeeds, kreditSeed } from '@/data/kredit';
import { money } from '@/data/mock';
import { useAccount } from '@/state/account';
import { colors, font } from '@/theme/tokens';

export default function SimKreditScreen() {
  const toast = useToast();
  const { refresh } = useAccount();
  const { data: detail = kreditDetailSeeds.simkredit } = useQuery('kredit/products/simkredit/', () => getKreditProduct('simkredit'), kreditDetailSeeds.simkredit);
  const { data: list = kreditSeed } = useQuery('kredit/', getKredit, kreditSeed);
  const [planId, setPlanId] = useState<string>();
  const [busy, setBusy] = useState(false);
  const options = detail.options.length ? detail.options : [detail.amount];
  const amount = options.find((o) => String(o) === planId) ?? detail.amount;
  // The server prices the default amount only; the fee scales with the amount the user picks.
  const fee = detail.amount ? (detail.fee * amount) / detail.amount : 0;

  const take = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await takeKredit('simkredit', amount);
      void refresh();
      invalidate('kredit/');
      toast(`${detail.name} ${money(amount)} ₼ added to your balance`);
    } catch (e) {
      // 501 not_implemented carries the text to show in `detail`.
      toast(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <CollapsingScreen
      backgroundColor="#231C2E"
      title={detail.name}
      subtitle={list.products.find((p) => p.id === 'simkredit')?.subtitle}
      footer={
        <PlanChooser
          plans={options.map((o) => ({ id: String(o), title: detail.name, price: o }))}
          selectedId={String(amount)}
          onSelect={setPlanId}
          ctaLabel={amount === detail.amount ? detail.cta : `Get ${detail.name} ${money(amount)} ₼`}
          onPress={() => void take()}
        />
      }>
      <View style={{ alignItems: 'center', paddingTop: 8 }}>
        <AppText variant="caption" tone="secondary">
          {`${detail.name} amount`}
        </AppText>
        <Animated.View key={planId} entering={FadeIn.duration(220)} style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
          <AppText style={{ fontFamily: font.regular, fontSize: 52, lineHeight: 58, color: colors.text }}>{amount}</AppText>
          <AppText style={{ fontFamily: font.regular, fontSize: 32, lineHeight: 38, color: colors.text }}>₼</AppText>
        </Animated.View>
        <AppText variant="caption" tone="secondary" style={{ marginTop: 6 }}>
          {`${money(fee)} ₼ Service fee`}
        </AppText>
      </View>
      <View style={{ marginTop: 28 }}>
        <HelpCard color={colors.cardRaised} />
      </View>
      <View style={{ height: 220 }} />
    </CollapsingScreen>
  );
}
