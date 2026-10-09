import { useLocalSearchParams } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { errorMessage } from '@/api/client';
import { invalidate, setQueryData, useQuery } from '@/api/query';
import { getRedesign, saveRedesign, tariffPath, toRedesign } from '@/api/tariffs';
import { Broadcast, FacebookLogo, Info, InstagramLogo, MonitorPlay, Phone, TiktokLogo } from '@/components/icons';
import { NavHeader } from '@/components/NavHeader';
import { Screen } from '@/components/Screen';
import { StepSlider } from '@/components/StepSlider';
import { useToast } from '@/components/Toast';
import { Button } from '@/components/ui/Button';
import { Tap } from '@/components/ui/Tap';
import { LayaSpot } from '@/laya/LayaSpot';
import { setLayaUi, signal } from '@/laya/store';
import { money } from '@/data/mock';
import { redesignSeed, type RedesignSlider, type SliderKey } from '@/data/myTariff';
import { colors } from '@/theme/tokens';

function Dot({ color, size = 22, children, style }: { color: string; size?: number; children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.dot, { width: size, height: size, borderRadius: size / 2, backgroundColor: color }, style]}>{children}</View>;
}

const icons: Record<SliderKey, ReactNode> = {
  internet: <Broadcast size={22} color={colors.blue} weight="regular" />,
  calls: <Phone size={22} color={colors.accent} weight="regular" />,
  instagramFb: (
    <View style={{ flexDirection: 'row' }}>
      <Dot color="#E1306C">
        <InstagramLogo size={13} color={colors.text} weight="fill" />
      </Dot>
      <Dot color="#1877F2" style={{ marginLeft: -6, borderWidth: 1.5, borderColor: colors.card }}>
        <FacebookLogo size={13} color={colors.text} weight="fill" />
      </Dot>
    </View>
  ),
  youtube: (
    <Dot color="#FF0000">
      <MonitorPlay size={13} color={colors.text} weight="fill" />
    </Dot>
  ),
  tiktok: (
    <Dot color="#111111">
      <TiktokLogo size={13} color={colors.text} weight="fill" />
    </Dot>
  ),
};

/** Slider values handed over by a link (the IsteSen+ card), as the first edit. */
function parseValues(raw?: string): Partial<Record<SliderKey, number>> {
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? (parsed as Partial<Record<SliderKey, number>>) : {};
  } catch {
    return {};
  }
}

export default function RedesignTariffScreen() {
  const toast = useToast();
  const { values: valuesParam } = useLocalSearchParams<{ values?: string }>();
  const { data: redesign = redesignSeed } = useQuery(tariffPath.redesign, () => getRedesign().then(toRedesign), redesignSeed);
  const { sliders, pricing, estimate } = redesign;
  // Only moved sliders are stored, so the server's current values stay the baseline until a drag.
  const [edited, setEdited] = useState<Partial<Record<SliderKey, number>>>(() => parseValues(valuesParam));
  const valueOf = (s: RedesignSlider) => edited[s.key] ?? s.initial;

  const changed = sliders.some((s) => valueOf(s) !== s.initial);
  // The unchanged tariff costs `estimate`; every GB or minute away from today's value moves it by its rate, down as well as up.
  const price = sliders.reduce((sum, s) => sum + (valueOf(s) - s.initial) * (s.key === 'calls' ? pricing.perMinute : pricing.perGb), estimate);

  const save = async () => {
    try {
      const res = await saveRedesign(Object.fromEntries(sliders.map((s) => [s.key, valueOf(s)])) as Record<SliderKey, number>);
      setQueryData(tariffPath.redesign, toRedesign(res));
      invalidate('tariffs/');
      invalidate('insights/');
      setEdited({});
      toast('Saved for the next renewal');
      signal('redesignSaved');
    } catch (e) {
      toast(errorMessage(e));
      setLayaUi({ error: errorMessage(e) });
      signal('failed');
    }
  };

  return (
    <Screen
      footer={
        <LayaSpot id="redesign.save" press={() => void save()}>
          <Button size="lg" label={`Save: ${money(price)} ₼`} disabled={!changed} onPress={() => void save()} />
        </LayaSpot>
      }>
      <NavHeader
        title="Redesign for next renewal"
        subtitle={null}
        right={
          <Tap
            hitSlop={10}
            haptic={false}
            accessibilityRole="button"
            accessibilityLabel="Redesign help"
            onPress={() => toast('Redesign help is not part of this prototype yet')}>
            <Info size={22} color={colors.text} weight="regular" />
          </Tap>
        }
      />
      <View style={{ gap: 12, marginTop: 8 }}>
        {sliders.map((s) => (
          <LayaSpot key={s.key} id={`redesign.${s.key}`} setValue={(v) => setEdited((prev) => ({ ...prev, [s.key]: Number(v) }))}>
            <StepSlider
              icon={icons[s.key]}
              label={s.label}
              min={s.min}
              max={s.max}
              step={s.step}
              value={valueOf(s)}
              onChange={(v) => setEdited((prev) => ({ ...prev, [s.key]: v }))}
            />
          </LayaSpot>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  dot: { alignItems: 'center', justifyContent: 'center' },
});
