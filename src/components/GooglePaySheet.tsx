import * as LocalAuthentication from 'expo-local-authentication';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, { Easing, FadeIn, runOnJS, useAnimatedStyle, useSharedValue, withTiming, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Check, CreditCard, X } from '@/components/icons';
import { AppText, tabular } from '@/components/ui/AppText';
import { Tap } from '@/components/ui/Tap';
import { money } from '@/data/mock';
import { useSession } from '@/state/session';
import { AyselBubble } from '@/components/aysel/Bubble';
import { LayaCursor } from '@/laya/cursor';
import { setLayaUi, signal } from '@/laya/store';
import { useLayaTarget } from '@/laya/targets';
import { font, layout } from '@/theme/tokens';

type Props = {
  visible: boolean;
  amount: number;
  onClose: () => void;
  /** Called once the simulated payment succeeds. */
  onPaid: () => void;
};

const PROCESS_MS = 1400;
const DONE_MS = 1100;
const ink = '#1F1F1F';
const inkSoft = '#5F6368';
const line = '#E3E3E8';

/** Device biometrics (fingerprint / Face ID) before the payment; skipped where none is set up. */
async function confirmIdentity(amount: number) {
  try {
    const [hardware, enrolled] = await Promise.all([LocalAuthentication.hasHardwareAsync(), LocalAuthentication.isEnrolledAsync()]);
    if (!hardware || !enrolled) return true;
    const result = await LocalAuthentication.authenticateAsync({ promptMessage: `Pay ${money(amount)} ₼`, cancelLabel: 'Cancel' });
    return result.success;
  } catch {
    return true;
  }
}

/**
 * Simulated Google Pay checkout sheet: merchant, amount, saved card, Pay.
 * Light surface like the real sheet, no Google branding. In-memory only; the API comes later.
 */
export function GooglePaySheet({ visible, amount, onClose, onPaid }: Props) {
  const insets = useSafeAreaInsets();
  const { account } = useSession();
  const [closed, setClosed] = useState(!visible);
  const [phase, setPhase] = useState<'ready' | 'processing' | 'done'>('ready');
  const progress = useSharedValue(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  if (visible && closed) setClosed(false);
  const mounted = visible || !closed;

  useEffect(() => {
    if (visible) {
      progress.value = withTiming(1, { duration: 320, easing: Easing.out(Easing.cubic) });
    } else if (mounted) {
      progress.value = withTiming(0, { duration: 220, easing: Easing.in(Easing.cubic) }, (done) => {
        if (done) runOnJS(setClosed)(true);
      });
    }
  }, [visible, mounted, progress]);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  // The sheet is its own window: while it shows, the docked bot lives inside it.
  useEffect(() => {
    if (!visible) return;
    setLayaUi({ host: 'sheet' });
    return () => setLayaUi({ host: 'root' });
  }, [visible]);

  const pay = async () => {
    if (!(await confirmIdentity(amount))) {
      signal('authFailed');
      return;
    }
    setPhase('processing');
    timer.current = setTimeout(() => {
      setPhase('done');
      timer.current = setTimeout(() => {
        setPhase('ready');
        onPaid();
      }, DONE_MS);
    }, PROCESS_MS);
  };

  const payRef = useRef<View>(null);
  useLayaTarget('gpay.pay', payRef, { press: () => void pay() });

  const dismiss = () => {
    if (phase !== 'ready') return;
    onClose();
  };

  const backdrop = useAnimatedStyle(() => ({ opacity: progress.value }));
  const card = useAnimatedStyle(() => ({ transform: [{ translateY: (1 - progress.value) * 480 }] }));

  if (!mounted) return null;

  return (
    <Modal transparent visible animationType="none" onRequestClose={dismiss} statusBarTranslucent>
      <View style={styles.root}>
        <Animated.View style={[StyleSheet.absoluteFill, backdrop]}>
          <Pressable accessibilityLabel="Close" onPress={dismiss} style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.55)' }]} />
        </Animated.View>
        <View style={styles.frame} pointerEvents="box-none">
          <Animated.View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) + 8 }, card]}>
            <View style={styles.head}>
              <AppText style={styles.headTitle}>Pay</AppText>
              <Tap hitSlop={10} haptic={false} accessibilityRole="button" accessibilityLabel="Close" onPress={dismiss} disabled={phase !== 'ready'}>
                <X size={22} color={ink} weight="regular" />
              </Tap>
            </View>

            {phase === 'done' ? (
              <Animated.View entering={FadeIn.duration(200)} style={styles.done}>
                <Animated.View entering={ZoomIn.duration(320)} style={styles.doneBadge}>
                  <Check size={30} color="#FFFFFF" weight="bold" />
                </Animated.View>
                <AppText style={styles.doneTitle}>Payment completed</AppText>
                <AppText style={[styles.doneAmount, tabular]}>{money(amount)} ₼</AppText>
                <AppText style={styles.doneSub}>Added to {account.number}</AppText>
              </Animated.View>
            ) : (
              <>
                <View style={styles.merchant}>
                  <View style={styles.merchantMark}>
                    <AppText style={styles.merchantMarkText}>A</AppText>
                  </View>
                  <View style={{ flex: 1 }}>
                    <AppText style={styles.merchantName}>Azercell</AppText>
                    <AppText style={styles.merchantSub}>Top up {account.number}</AppText>
                  </View>
                  <AppText style={[styles.amount, tabular]}>{money(amount)} ₼</AppText>
                </View>
                <View style={styles.row}>
                  <View style={styles.cardIcon}>
                    <CreditCard size={20} color={ink} weight="regular" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <AppText style={styles.rowTitle}>Mastercard •••• 4471</AppText>
                    <AppText style={styles.rowSub}>Default payment method</AppText>
                  </View>
                  <AppText style={styles.change}>Change</AppText>
                </View>
                <AppText style={styles.legal}>No fee from Azercell. Your bank may apply its own charges.</AppText>
                <View ref={payRef} collapsable={false}>
                <Tap
                  accessibilityRole="button"
                  accessibilityLabel={`Pay ${money(amount)} manat`}
                  accessibilityState={{ busy: phase === 'processing' }}
                  disabled={phase === 'processing'}
                  onPress={() => void pay()}
                  style={styles.pay}>
                  {phase === 'processing' ? <ActivityIndicator color="#FFFFFF" /> : <AppText style={styles.payLabel}>Pay</AppText>}
                </Tap>
                </View>
              </>
            )}
          </Animated.View>
        </View>
      </View>
      <LayaCursor />
      <AyselBubble host="sheet" />
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  frame: { alignSelf: 'center', width: '100%', maxWidth: layout.maxWidth },
  sheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingTop: 14 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 40, marginBottom: 8 },
  headTitle: { fontFamily: font.semibold, fontSize: 20, lineHeight: 26, color: ink },
  merchant: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: line },
  merchantMark: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#7B41E8', alignItems: 'center', justifyContent: 'center' },
  merchantMarkText: { fontFamily: font.bold, fontSize: 20, lineHeight: 24, color: '#FFFFFF' },
  merchantName: { fontFamily: font.semibold, fontSize: 17, lineHeight: 22, color: ink },
  merchantSub: { fontFamily: font.regular, fontSize: 13, lineHeight: 18, color: inkSoft, marginTop: 2 },
  amount: { fontFamily: font.bold, fontSize: 22, lineHeight: 28, color: ink },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: line },
  cardIcon: { width: 44, height: 30, borderRadius: 6, borderWidth: 1, borderColor: line, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontFamily: font.medium, fontSize: 15, lineHeight: 20, color: ink },
  rowSub: { fontFamily: font.regular, fontSize: 13, lineHeight: 18, color: inkSoft, marginTop: 2 },
  change: { fontFamily: font.medium, fontSize: 14, lineHeight: 18, color: '#1A73E8' },
  legal: { fontFamily: font.regular, fontSize: 12, lineHeight: 17, color: inkSoft, marginTop: 14, marginBottom: 18 },
  pay: { height: 52, borderRadius: 999, backgroundColor: ink, alignItems: 'center', justifyContent: 'center' },
  payLabel: { fontFamily: font.semibold, fontSize: 17, lineHeight: 22, color: '#FFFFFF' },
  done: { alignItems: 'center', paddingVertical: 18, gap: 6 },
  doneBadge: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#1E8E3E', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  doneTitle: { fontFamily: font.semibold, fontSize: 18, lineHeight: 24, color: ink },
  doneAmount: { fontFamily: font.bold, fontSize: 28, lineHeight: 34, color: ink },
  doneSub: { fontFamily: font.regular, fontSize: 13, lineHeight: 18, color: inkSoft },
});
