import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { longDate } from '@/api/client';
import { ADVISOR_KEY, getAdvisor } from '@/api/insights';
import { useQuery } from '@/api/query';
import { changeTariff, getChangeGroups, runTariffAction, tariffPath, toChangeGroups } from '@/api/tariffs';
import {
  ArrowCounterClockwise,
  Broadcast,
  CellSignalFull,
  ChatText,
  FacebookLogo,
  Fire,
  InstagramLogo,
  Phone,
  Star,
  TelegramLogo,
  TiktokLogo,
  WhatsappLogo,
} from '@/components/icons';
import { NavHeader } from '@/components/NavHeader';
import { useToast } from '@/components/Toast';
import { AppText, tabular } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { Pill } from '@/components/ui/Pill';
import { Tap } from '@/components/ui/Tap';
import { LayaSpot } from '@/laya/LayaSpot';
import { useAccount } from '@/state/account';
import type { Social } from '@/data/mock';
import { changeGroups, tariffSurface, type ChangeFeatureKind, type ChangeTariff } from '@/data/myTariff';
import { colors, font, headerGradient, layout, radius } from '@/theme/tokens';

const socials: Record<Social, { color: string; icon: ReactNode }> = {
  whatsapp: { color: '#25D366', icon: <WhatsappLogo size={15} color={colors.text} weight="fill" /> },
  telegram: { color: '#2AABEE', icon: <TelegramLogo size={15} color={colors.text} weight="fill" /> },
  instagram: { color: '#E1306C', icon: <InstagramLogo size={15} color={colors.text} weight="fill" /> },
  facebook: { color: '#1877F2', icon: <FacebookLogo size={15} color={colors.text} weight="fill" /> },
  tiktok: { color: '#111111', icon: <TiktokLogo size={15} color={colors.text} weight="fill" /> },
};

const featureIcons: Record<ChangeFeatureKind, ReactNode> = {
  data: <Broadcast size={14} color={colors.accentIcon} weight="regular" />,
  minutes: <Phone size={14} color={colors.accentIcon} weight="regular" />,
  sms: <ChatText size={14} color={colors.accentIcon} weight="regular" />,
  roaming: <CellSignalFull size={14} color={colors.accentIcon} weight="regular" />,
};

export default function ChangeTariffScreen() {
  const router = useRouter();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const { applyMoney } = useAccount();
  const advisor = useQuery(ADVISOR_KEY, getAdvisor).data;
  const plus = advisor?.recommended === 'istesen-plus' ? advisor.candidates.find((c) => c.id === 'istesen-plus') : undefined;
  const { data: groups = changeGroups } = useQuery(tariffPath.change, () => getChangeGroups().then(toChangeGroups), changeGroups);
  const [groupKey, setGroupKey] = useState('digimax');
  const group = groups.find((g) => g.key === groupKey) ?? groups[0];

  const open = (t: ChangeTariff) => {
    if (t.familyId) router.push({ pathname: '/tariffs/[id]', params: { id: t.familyId } });
    else void runTariffAction(() => changeTariff(t.id), toast, applyMoney, (res) => `${res.tariff.title} activated for ${res.tariff.price} ₼`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <LinearGradient
        colors={headerGradient}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={{ paddingTop: Math.max(insets.top, 14), paddingHorizontal: layout.gutter, paddingBottom: 30 }}>
        <NavHeader title="Change tariff" subtitle={null} />
      </LinearGradient>

      <ScrollView
        style={styles.body}
        contentContainerStyle={{ paddingHorizontal: layout.gutter, paddingTop: 20, paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}>
        {plus && advisor ? (
          <Tap
            pressScale={0.99}
            accessibilityRole="button"
            accessibilityLabel="IsteSen+, recommended by AIsel"
            onPress={() => router.push({ pathname: '/my-tariff/redesign', params: { values: JSON.stringify(plus.redesign ?? {}) } })}
            style={{ marginBottom: 14 }}>
            <Card color={tariffSurface}>
              <LinearGradient colors={['#6C6AF0', '#A57CF4']} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.newPill}>
                <Star size={12} color={colors.text} weight="fill" />
                <AppText variant="label" style={{ fontSize: 12 }}>
                  AISEL RECOMMENDS
                </AppText>
              </LinearGradient>
              <View style={[styles.between, { marginTop: 14 }]}>
                <AppText variant="heading" style={styles.name}>
                  {plus.title}
                </AppText>
                <AppText variant="title" style={tabular}>
                  {plus.price}
                  <AppText variant="bodyMedium" style={{ fontSize: 15 }}>
                    {' '}₼
                  </AppText>
                </AppText>
              </View>
              <View style={[styles.row, { marginTop: 6, gap: 8 }]}>
                <ArrowCounterClockwise size={16} color={colors.textSecondary} />
                <AppText variant="caption" tone="secondary" style={{ fontSize: 14 }}>
                  {`Saves ${plus.saving_month} ₼ a month · from ${longDate(advisor.effective_from)}`}
                </AppText>
              </View>
              <View style={[styles.row, { marginTop: 12, flexWrap: 'wrap', gap: 8 }]}>
                {plus.data_gb != null ? <Pill tone="outline" label={`${plus.data_gb} GB`} icon={featureIcons.data} /> : null}
                {plus.minutes != null ? <Pill tone="outline" label={`${plus.minutes} min.`} icon={featureIcons.minutes} /> : null}
              </View>
            </Card>
          </Tap>
        ) : null}

        <View style={styles.chips}>
          {groups.map((g) => {
            const selected = g.key === groupKey;
            return (
              <LayaSpot key={g.key} id={`change.group.${g.key}`} press={() => setGroupKey(g.key)}>
                <Tap
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => setGroupKey(g.key)}
                  style={[styles.chip, selected ? { backgroundColor: colors.accent } : styles.chipOff]}>
                  {g.key === 'digimax' ? <Fire size={16} color={colors.orange} weight="fill" /> : null}
                  <AppText style={{ fontFamily: font.regular, fontSize: 16, lineHeight: 22 }}>{g.label}</AppText>
                </Tap>
              </LayaSpot>
            );
          })}
        </View>

        <View style={{ gap: 12, marginTop: 14 }}>
          {group.tariffs.map((t) => (
            <LayaSpot key={t.id} id={`change.card.${t.id}`} press={() => open(t)}>
            <Tap pressScale={0.99} accessibilityRole="button" accessibilityLabel={t.name} onPress={() => open(t)}>
              <Card color={tariffSurface}>
                {t.isNew ? (
                  <LinearGradient colors={['#6C6AF0', '#A57CF4']} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.newPill}>
                    <Fire size={12} color={colors.orange} weight="fill" />
                    <AppText variant="label" style={{ fontSize: 12 }}>
                      NEW
                    </AppText>
                  </LinearGradient>
                ) : null}
                <View style={[styles.between, t.isNew && { marginTop: 14 }]}>
                  <AppText variant="heading" style={styles.name}>
                    {t.name}
                  </AppText>
                  <AppText variant="title" style={tabular}>
                    {t.price}
                    <AppText variant="bodyMedium" style={{ fontSize: 15 }}>
                      {' '}₼
                    </AppText>
                  </AppText>
                </View>
                <View style={[styles.row, { marginTop: 6, gap: 8 }]}>
                  {t.period ? (
                    <>
                      <ArrowCounterClockwise size={16} color={colors.textSecondary} />
                      <AppText variant="caption" tone="secondary" style={{ fontSize: 14 }}>
                        {t.period}
                      </AppText>
                    </>
                  ) : (
                    <>
                      <View style={styles.crest}>
                        <Star size={12} color="#F2E7D8" weight="fill" />
                      </View>
                      <AppText variant="caption" tone="secondary" style={{ fontSize: 14 }}>
                        {t.tagline}
                      </AppText>
                    </>
                  )}
                </View>
                <View style={[styles.row, { marginTop: 12, flexWrap: 'wrap', gap: 8 }]}>
                  {t.socials.length > 0 ? (
                    <View style={[styles.row, { marginRight: 4 }]}>
                      {t.socials.map((s, i) => (
                        <View key={s} style={[styles.social, { backgroundColor: socials[s].color }, i > 0 && { marginLeft: -7 }]}>
                          {socials[s].icon}
                        </View>
                      ))}
                    </View>
                  ) : null}
                  {t.features.map((f) => (
                    <Pill key={f.label} tone="outline" label={f.label} icon={featureIcons[f.kind]} />
                  ))}
                </View>
              </Card>
            </Tap>
            </LayaSpot>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Black body that overlaps the header gradient so its rounded top shows the gradient.
  body: { flex: 1, marginTop: -22, borderTopLeftRadius: 22, borderTopRightRadius: 22, backgroundColor: colors.bg, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center' },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  chips: { flexDirection: 'row', gap: 10 },
  chip: { height: 46, paddingHorizontal: 22, borderRadius: radius.pill, flexDirection: 'row', alignItems: 'center', gap: 4 },
  chipOff: { borderWidth: 1, borderColor: colors.accent },
  newPill: { alignSelf: 'flex-start', height: 26, paddingHorizontal: 10, borderRadius: radius.pill, flexDirection: 'row', alignItems: 'center', gap: 4 },
  name: { fontFamily: font.medium, fontSize: 20 },
  crest: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#8B7456', alignItems: 'center', justifyContent: 'center' },
  social: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: tariffSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
