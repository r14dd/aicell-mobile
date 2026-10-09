import * as Clipboard from 'expo-clipboard';
import { Share, View } from 'react-native';

import { HelpCard } from '@/components/HelpCard';
import { Copy, Link } from '@/components/icons';
import { NavHeader } from '@/components/NavHeader';
import { Screen } from '@/components/Screen';
import { useToast } from '@/components/Toast';
import { AppText, tabular } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Divider } from '@/components/ui/Divider';
import { Tap } from '@/components/ui/Tap';
import { useQuery } from '@/api/query';
import { getReferral, type Referral } from '@/api/referral';
import { money, referralSteps, subscriber } from '@/data/mock';
import { colors, font } from '@/theme/tokens';

const seed: Referral = {
  code: subscriber.referralCode,
  earned: subscriber.earned,
  headline: 'Share Azercell app and get 3.00 ₼ bonus!',
  steps: referralSteps,
  shareMessage: `Join me on the Azercell app and use my referral code ${subscriber.referralCode}`,
};

export default function InviteScreen() {
  const toast = useToast();
  const { data } = useQuery('referral/me/', getReferral, seed);
  const { code, earned, headline, steps, shareMessage } = data ?? seed;
  const [whole, cents] = money(earned).split('.');

  const copy = async () => {
    await Clipboard.setStringAsync(code);
    toast('Referral code copied');
  };

  const share = async () => {
    try {
      await Share.share({ message: shareMessage });
    } catch {
      toast('Sharing is not available here, the code is ' + code);
    }
  };

  return (
    <Screen>
      <NavHeader />
      <AppText variant="display" style={{ fontSize: 30, lineHeight: 36, marginTop: 8 }}>
        Invite your friend and earn
      </AppText>
      <AppText variant="body" style={{ fontSize: 17, marginTop: 10 }}>
        {headline}
      </AppText>

      <Card style={{ marginTop: 20 }}>
        <AppText variant="body" style={{ fontSize: 17 }}>
          Earned amount
        </AppText>
        <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'baseline' }}>
          <AppText style={[tabular, { fontFamily: font.bold, fontSize: 40, lineHeight: 46, color: colors.text }]}>{whole}</AppText>
          <AppText style={[tabular, { fontFamily: font.bold, fontSize: 24, lineHeight: 30, color: colors.text }]}>.{cents}</AppText>
          <AppText style={{ fontFamily: font.medium, fontSize: 20, lineHeight: 26, color: colors.text }}> ₼</AppText>
        </View>
        <AppText variant="small" tone="secondary" style={{ marginTop: 6 }}>
          Bonus will be awarded once conditions are met
        </AppText>
        <Divider style={{ marginVertical: 16 }} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <AppText variant="body" style={{ fontSize: 17 }}>
            Referral code
          </AppText>
          <Tap
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={`Copy referral code ${code}`}
            onPress={copy}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <AppText variant="body" style={{ fontSize: 17 }}>
              {code}
            </AppText>
            <Copy size={22} color={colors.accentIcon} />
          </Tap>
        </View>
        <Button
          variant="gradient"
          size="lg"
          label="Share app"
          icon={<Link size={20} color={colors.text} weight="bold" />}
          style={{ marginTop: 20 }}
          onPress={share}
        />
      </Card>

      <AppText variant="heading" style={{ marginTop: 32, marginBottom: 14 }}>
        How to get a referral bonus ?
      </AppText>
      <Card color="#2B2345">
        {steps.map((step, i) => (
          <View key={step.title} style={{ flexDirection: 'row', gap: 16, alignItems: 'flex-start', marginTop: i > 0 ? 24 : 0 }}>
            <View
              style={{
                width: 34,
                height: 34,
                borderRadius: 17,
                backgroundColor: colors.accent,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <AppText variant="bodySemibold">{i + 1}</AppText>
            </View>
            <View style={{ flex: 1 }}>
              <AppText variant="bodyMedium" style={{ fontSize: 17, lineHeight: 23 }}>
                {step.title}
              </AppText>
              <AppText variant="body" style={{ fontSize: 16, lineHeight: 22, color: '#D5D0E0', marginTop: 4 }}>
                {step.body}
              </AppText>
              {i === steps.length - 1 ? (
                <View style={{ marginTop: 12, flexDirection: 'row' }}>
                  <Tap
                    haptic={false}
                    accessibilityRole="link"
                    onPress={() => toast('Terms of Use are not part of this prototype yet')}>
                    <AppText variant="bodyMedium" tone="info">
                      Terms of Use
                    </AppText>
                  </Tap>
                  <AppText variant="body"> applied</AppText>
                </View>
              ) : null}
            </View>
          </View>
        ))}
        <Divider style={{ marginTop: 20 }} />
        <View style={{ marginTop: 16, backgroundColor: colors.noteBg, borderRadius: 14, padding: 14 }}>
          <AppText variant="small" tone="accent" style={{ textAlign: 'center' }}>
            In some cases, the referral code may not appear automatically during registration. If so, your friend should manually enter the code provided above.
          </AppText>
        </View>
      </Card>

      <View style={{ marginTop: 24 }}>
        <HelpCard />
      </View>
    </Screen>
  );
}
