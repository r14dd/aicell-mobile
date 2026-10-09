import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef } from 'react';
import { Platform, ScrollView, StyleSheet, View, useWindowDimensions, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';

import { useToast } from '@/components/Toast';
import { Tap } from '@/components/ui/Tap';
import type { Banner } from '@/data/mock';
import { layout, radius } from '@/theme/tokens';

type Props = {
  items: Banner[];
  aspect?: number;
  /** Negative margin so the strip bleeds to the screen edge. */
  bleed?: boolean;
};

const GAP = 6;

/**
 * Promo strip as in the real app: the first banner sits on the content gutter with the next one
 * peeking at the right; once swiped, the released banner settles in the centre with its
 * neighbours peeking on both sides.
 */
export function BannerCarousel({ items, aspect = 2.85, bleed = true }: Props) {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const toast = useToast();
  const screen = Math.min(width, layout.maxWidth);
  const itemW = screen - layout.gutter * 2 - 2;
  const itemH = Math.round(itemW / aspect);
  const step = itemW + GAP;
  const sidePad = Math.round((screen - itemW) / 2);
  const offsets = useMemo(() => items.map((_, i) => (i === 0 ? 0 : layout.gutter + i * step - sidePad)), [items, step, sidePad]);

  const ref = useRef<ScrollView>(null);
  const scrollX = useRef(0);
  const drag = useRef<{ startX: number; startScroll: number; moved: boolean } | null>(null);
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollX.current = e.nativeEvent.contentOffset.x;
  };

  // Mouse drag for the web preview; touch scrolling already works natively.
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const nearest = (x: number) => offsets.reduce((best, o) => (Math.abs(o - x) < Math.abs(best - x) ? o : best), offsets[0] ?? 0);
    const node = (ref.current as unknown as { getScrollableNode?: () => HTMLElement | null } | null)?.getScrollableNode?.();
    if (!node) return;
    let active: { startX: number; startScroll: number; moved: boolean } | null = null;
    const down = (e: MouseEvent) => {
      e.preventDefault(); // no text selection while dragging
      active = { startX: e.pageX, startScroll: node.scrollLeft, moved: false };
    };
    const noDrag = (e: Event) => e.preventDefault(); // the browser's image drag would swallow mousemove
    const move = (e: MouseEvent) => {
      if (!active) return;
      const dx = e.pageX - active.startX;
      if (Math.abs(dx) > 4) active.moved = true;
      if (active.moved) {
        e.preventDefault();
        node.scrollLeft = active.startScroll - dx;
      }
    };
    const up = () => {
      if (!active) return;
      const moved = active.moved;
      active = null;
      if (moved) {
        drag.current = { startX: 0, startScroll: 0, moved: true };
        // Element.scroll, not scrollTo: react-native-web replaces the node's scrollTo with its own {x, y} signature
        node.scroll({ left: nearest(node.scrollLeft), behavior: 'smooth' });
        setTimeout(() => {
          drag.current = null;
        }, 250);
      }
    };
    node.addEventListener('mousedown', down);
    node.addEventListener('dragstart', noDrag);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => {
      node.removeEventListener('mousedown', down);
      node.removeEventListener('dragstart', noDrag);
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
  }, [offsets]);

  return (
    <View style={bleed ? { marginHorizontal: -layout.gutter } : null}>
      <ScrollView
        ref={ref}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToOffsets={offsets}
        disableIntervalMomentum
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingLeft: layout.gutter, paddingRight: sidePad, gap: GAP }}>
        {items.map((b) => (
          <Tap
            key={b.key}
            pressScale={0.985}
            accessibilityRole="button"
            accessibilityLabel={b.alt}
            onPress={() => {
              if (drag.current?.moved) return;
              if (b.href) router.push(b.href);
              else toast(b.note ?? b.alt);
            }}
            style={[styles.item, { width: itemW, height: itemH }]}>
            <Image source={b.image} style={StyleSheet.absoluteFill} contentFit="cover" transition={120} />
          </Tap>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  item: { borderRadius: radius.lg, overflow: 'hidden', backgroundColor: '#2A2438' },
});
