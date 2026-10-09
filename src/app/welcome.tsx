import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CaretRight, SimCard } from '@/components/icons';
import { useToast } from '@/components/Toast';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { AzFlag, UkFlag } from '@/components/ui/Flag';
import { Tap } from '@/components/ui/Tap';
import { img } from '@/data/assets';
import { errorMessage } from '@/api/client';
import { useSession } from '@/state/session';
import { colors, font, layout, radius } from '@/theme/tokens';

const surface = '#231C2E';
const field = '#2B2438';
const heroGradient = ['#733EDC', '#8D30D3'] as const;
const splashGradient = ['#793BD9', '#8734D4'] as const;
const INTRO_MARK_MS = 600;
const INTRO_HOLD_MS = 1500;
const INTRO_FADE_MS = 400;
const SIGN_IN_MS = 900;

/**
 * Signed-out entry: the violet splash (mark, then wordmark) settles into the welcome page.
 * Saved numbers sign in with one tap; the phone field leads to manual entry.
 */
export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const toast = useToast();
  const { accounts, signIn } = useSession();
  const [intro, setIntro] = useState<'mark' | 'wordmark' | 'done'>('mark');
  const [busy, setBusy] = useState(false);
  const splash = useSharedValue(1);

  useEffect(() => {
    const t1 = setTimeout(() => setIntro('wordmark'), INTRO_MARK_MS);
    const t2 = setTimeout(() => setIntro('done'), INTRO_HOLD_MS + INTRO_FADE_MS);
    splash.value = withDelay(INTRO_HOLD_MS, withTiming(0, { duration: INTRO_FADE_MS }));
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [splash]);

  const splashStyle = useAnimatedStyle(() => ({ opacity: splash.value }));

  const pick = (number: string) => {
    setBusy(true);
    signIn(number)
      .then(() => {
        // The sign-in spinner stays for the recorded duration.
        setTimeout(() => router.replace('/'), SIGN_IN_MS);
      })
      .catch((e: unknown) => {
        setBusy(false);
        toast(errorMessage(e));
      });
  };

  return (
    <View style={styles.root}>
      <ScrollView style={styles.column} contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 20 }} showsVerticalScrollIndicator={false} bounces={false}>
        <LinearGradient colors={heroGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.hero, { paddingTop: insets.top + 10 }]}>
          <View style={styles.pager}>
            {[0, 1, 2, 3, 4].map((i) => (
              <View key={i} style={[styles.segment, i === 0 && styles.segmentOn]} />
            ))}
          </View>
          <View style={styles.welcomeRow}>
            <Image source={img.splashMark} style={styles.markSmall} contentFit="contain" />
            <AppText variant="caption" style={styles.welcomeText}>
              Welcome to Azercell!
            </AppText>
            <View style={{ flex: 1 }} />
            <Tap haptic={false} accessibilityRole="button" accessibilityLabel="Language: English" onPress={() => toast('Language selection is not part of this prototype yet')}>
              <UkFlag size={24} />
            </Tap>
          </View>
          <AppText variant="display" style={styles.title}>
            Discover the Azercell app!
          </AppText>
          <Image source={img.welcomeIllustration} style={styles.illustration} contentFit="contain" />
        </LinearGradient>

        <View style={styles.panel}>
          <AppText variant="label" tone="secondary" style={styles.sectionLabel}>
            SELECT NUMBER
          </AppText>
          {accounts.map((a, i) => (
            <View key={a.number}>
              {i > 0 ? <Divider /> : null}
              <Tap accessibilityRole="button" accessibilityLabel={`Sign in as ${a.number}`} onPress={() => pick(a.number)} style={styles.numberRow}>
                <View style={styles.simDisc}>
                  <SimCard size={22} color={colors.accentIcon} weight="light" />
                </View>
                <View style={{ flex: 1 }}>
                  <AppText variant="bodySemibold" style={{ fontSize: 17 }}>
                    {a.number}
                  </AppText>
                  <AppText variant="caption" tone="secondary">
                    {`${a.plan} · ${a.tariff}`}
                  </AppText>
                </View>
                <CaretRight size={18} color={colors.textSecondary} />
              </Tap>
            </View>
          ))}

          <View style={styles.phoneRow}>
            <View style={styles.prefix}>
              <AzFlag size={20} />
              <AppText variant="bodyMedium" style={{ fontSize: 16 }}>
                +994
              </AppText>
            </View>
            <Tap accessibilityRole="button" accessibilityLabel="Phone number" onPress={() => router.push('/login/number')} style={styles.phoneField}>
              <AppText variant="body" tone="secondary" style={{ fontSize: 16 }}>
                Phone number
              </AppText>
            </Tap>
          </View>
          <Button label="Enter the app" size="md" style={styles.cta} onPress={() => router.push('/login/number')} />
          <View style={styles.orRow}>
            <View style={styles.hairline} />
            <AppText variant="label" tone="secondary">
              OR
            </AppText>
            <View style={styles.hairline} />
          </View>
          <Button label="Continue as a guest" variant="outline" size="md" onPress={() => toast('Guest mode is not part of this prototype yet')} />
        </View>
      </ScrollView>

      {intro !== 'done' ? (
        <Animated.View pointerEvents="none" style={[styles.splash, splashStyle]}>
          <LinearGradient colors={splashGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.splashFill}>
            <Image source={intro === 'mark' ? img.splashMark : img.splashWordmark} style={intro === 'mark' ? styles.splashMark : styles.splashWordmark} contentFit="contain" />
          </LinearGradient>
        </Animated.View>
      ) : null}
      {busy ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.text} size="large" />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: surface, alignItems: 'center' },
  column: { flex: 1, width: '100%', maxWidth: layout.maxWidth },
  hero: { paddingHorizontal: 16, paddingBottom: 14 },
  pager: { flexDirection: 'row', gap: 6 },
  segment: { flex: 1, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.35)' },
  segmentOn: { backgroundColor: '#FFFFFF' },
  welcomeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 8 },
  markSmall: { width: 22, height: 21 },
  welcomeText: { fontSize: 13 },
  title: { marginTop: 14, fontSize: 30, lineHeight: 36, fontFamily: font.bold, maxWidth: 320 },
  illustration: { width: 300, height: 284, alignSelf: 'center', marginTop: 6 },
  panel: { paddingHorizontal: 16, paddingTop: 16 },
  sectionLabel: { letterSpacing: 0.6, marginBottom: 4 },
  numberRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 58 },
  simDisc: { width: 40, height: 40, borderRadius: 20, backgroundColor: field, alignItems: 'center', justifyContent: 'center' },
  phoneRow: { flexDirection: 'row', gap: 8, marginTop: 16 },
  prefix: { height: 48, paddingHorizontal: 14, borderRadius: radius.md, backgroundColor: field, flexDirection: 'row', alignItems: 'center', gap: 8 },
  phoneField: { flex: 1, height: 48, paddingHorizontal: 14, borderRadius: radius.md, backgroundColor: field, justifyContent: 'center' },
  cta: { marginTop: 14 },
  orRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14, marginBottom: 14 },
  hairline: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.lineStrong },
  splash: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  splashFill: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  splashMark: { width: 60, height: 58 },
  splashWordmark: { width: 196, height: 60 },
  loading: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000000', alignItems: 'center', justifyContent: 'center' },
});
