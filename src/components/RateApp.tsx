import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Star } from '@/components/icons';
import { Sheet } from '@/components/Sheet';
import { useToast } from '@/components/Toast';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Tap } from '@/components/ui/Tap';
import { rateApp } from '@/api/content';
import { colors } from '@/theme/tokens';

const RateContext = createContext<() => void>(() => {});

/** Shows the "Enjoying our app?" prompt once per session (like the real app) and on demand from More. */
export function RateAppProvider({ children, autoAfterMs = 20000 }: { children: ReactNode; autoAfterMs?: number }) {
  const [visible, setVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const shownOnce = useRef(false);
  const toast = useToast();

  const open = useCallback(() => {
    setRating(0);
    setVisible(true);
  }, []);

  useEffect(() => {
    if (!autoAfterMs) return;
    const id = setTimeout(() => {
      if (!shownOnce.current) {
        shownOnce.current = true;
        open();
      }
    }, autoAfterMs);
    return () => clearTimeout(id);
  }, [autoAfterMs, open]);

  const rate = (n: number) => {
    setRating(n);
    // The server words the thank-you; the local wording covers an unreachable server.
    const thanks = rateApp(n).then(
      (res) => res.message,
      () => (n >= 4 ? 'Thanks! Your rating helps us a lot' : 'Thanks for the feedback, we will do better'),
    );
    setTimeout(() => {
      setVisible(false);
      void thanks.then(toast);
    }, 450);
  };

  const value = useMemo(() => open, [open]);

  return (
    <RateContext.Provider value={value}>
      {children}
      <Sheet visible={visible} onClose={() => setVisible(false)} centered>
        <View style={styles.body}>
          <AppText variant="title" style={{ fontSize: 22, textAlign: 'center' }}>
            Enjoying our app?
          </AppText>
          <AppText variant="caption" tone="secondary" style={{ marginTop: 6, textAlign: 'center' }}>
            Tap a star to rate app
          </AppText>
          <View style={styles.stars} accessibilityRole="radiogroup">
            {[1, 2, 3, 4, 5].map((n) => (
              <Tap
                key={n}
                hitSlop={6}
                accessibilityRole="radio"
                accessibilityLabel={`${n} star${n > 1 ? 's' : ''}`}
                accessibilityState={{ selected: rating >= n }}
                onPress={() => rate(n)}>
                <Star size={32} color={rating >= n ? colors.accentLink : colors.accentIcon} weight={rating >= n ? 'fill' : 'regular'} />
              </Tap>
            ))}
          </View>
          <Button label="Ask me later" variant="outline" size="lg" onPress={() => setVisible(false)} style={{ marginTop: 24, alignSelf: 'stretch' }} />
        </View>
      </Sheet>
    </RateContext.Provider>
  );
}

export const useRateApp = () => useContext(RateContext);

const styles = StyleSheet.create({
  body: { alignItems: 'center', paddingTop: 4, paddingBottom: 4 },
  stars: { flexDirection: 'row', gap: 14, marginTop: 22 },
});
