import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState, type ComponentProps, type ReactNode } from 'react';
import { Gesture, GestureDetector, type PanGesture } from 'react-native-gesture-handler';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  FadeIn,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets, type EdgeInsets } from 'react-native-safe-area-context';

import {
  ArrowCounterClockwise,
  BookOpen,
  Broadcast,
  CalendarBlank,
  CellSignalFull,
  ChatText,
  Copy,
  Diamond,
  FacebookLogo,
  FilmSlate,
  Fire,
  InstagramLogo,
  MusicNotes,
  Phone,
  Plus,
  Star,
  TelegramLogo,
  TiktokLogo,
  WhatsappLogo,
  X,
} from '@/components/icons';
import { useToast } from '@/components/Toast';
import { AppText, tabular } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Pill } from '@/components/ui/Pill';
import { Tap } from '@/components/ui/Tap';
import { useQuery } from '@/api/query';
import { getStory, withApiStory } from '@/api/stories';
import { homeStories, hotTariffs, type Social, type TariffOffer } from '@/data/mock';
import { stories, type IconKey, type Story, type StoryBrand, type StoryItem, type StoryPage } from '@/data/stories';
import { useStories } from '@/state/stories';
import { colors, font, layout, radius } from '@/theme/tokens';

const PAGE_MS = 6000;
/** Story-to-story cube turn, timed from the recording (about five frames at 30 fps). */
const CUBE_MS = 240;

const icons: Record<IconKey, typeof Copy> = { BookOpen, CalendarBlank, Copy, Diamond, FilmSlate, MusicNotes, Plus };

/** Hand-placed tilts the recording shows on the floating cards. */
const brandTilt = ['-1.8deg', '1.8deg', '0.4deg'];
const bulletTilt = ['-2deg', '3deg', '-2.5deg'];

const diagonal = { start: { x: 0.2, y: 0 }, end: { x: 0.8, y: 1 } };
const sideways = { start: { x: 0, y: 0.5 }, end: { x: 1, y: 0.5 } };

function ItemContent({ it }: { it: StoryItem }) {
  return (
    <>
      <View style={{ flex: 1 }}>
        <AppText variant="bodySemibold" style={{ fontSize: 17 }}>
          {it.title}
        </AppText>
        <AppText variant="caption" style={{ color: 'rgba(255,255,255,0.72)', marginTop: 2 }}>
          {it.sub}
        </AppText>
      </View>
      <View style={styles.price}>
        <AppText style={[styles.priceText, tabular]}>{it.price} ₼</AppText>
      </View>
    </>
  );
}

function BrandContent({ brand, grouped }: { brand: StoryBrand; grouped?: boolean }) {
  const Icon = brand.icon ? icons[brand.icon] : null;
  return (
    <>
      <View style={[styles.tile, { backgroundColor: brand.color, borderRadius: grouped ? 10 : 20 }]}>
        {Icon ? (
          <Icon size={22} color={brand.ink ?? colors.text} weight="fill" />
        ) : (
          <AppText style={[styles.tileText, { color: brand.ink ?? colors.text }]}>{brand.monogram}</AppText>
        )}
      </View>
      <View style={{ flex: 1 }}>
        <AppText variant="subheading" numberOfLines={1}>
          {brand.name}
        </AppText>
        <AppText variant="caption" style={styles.brandSub}>
          {brand.sub}
        </AppText>
      </View>
      {brand.price ? (
        <View style={{ alignItems: 'flex-end' }}>
          {brand.from ? (
            <AppText variant="small" style={styles.brandSub}>
              From
            </AppText>
          ) : null}
          <AppText style={[styles.brandPrice, tabular]}>{brand.price} ₼</AppText>
        </View>
      ) : null}
    </>
  );
}

const socials: Record<Social, { color: string; icon: ReactNode }> = {
  whatsapp: { color: '#25D366', icon: <WhatsappLogo size={12} color={colors.text} weight="fill" /> },
  telegram: { color: '#2AABEE', icon: <TelegramLogo size={12} color={colors.text} weight="fill" /> },
  instagram: { color: '#E1306C', icon: <InstagramLogo size={12} color={colors.text} weight="fill" /> },
  facebook: { color: '#1877F2', icon: <FacebookLogo size={12} color={colors.text} weight="fill" /> },
  tiktok: { color: '#111111', icon: <TiktokLogo size={12} color={colors.text} weight="fill" /> },
};

const pillInk = 'rgba(255,255,255,0.88)';
const featureIcons: Record<TariffOffer['features'][number]['kind'], ReactNode> = {
  data: <Broadcast size={14} color={pillInk} weight="regular" />,
  minutes: <Phone size={14} color={pillInk} weight="regular" />,
  sms: <ChatText size={14} color={pillInk} weight="regular" />,
  roaming: <CellSignalFull size={14} color={pillInk} weight="regular" />,
};

/** The Hot offers cards in the order the recording stacks them. */
const storyTariffs = ['digimax-10', 'premium-60', 'digimax-25'].flatMap((id) => hotTariffs.filter((t) => t.id === id));

/** Loose stack of glass tariff cards: name and price, period or tagline, social cluster, feature pills. */
function TariffCards() {
  return (
    <View style={styles.tariffs}>
      {storyTariffs.map((t, i) => (
        <View
          key={t.id}
          style={[styles.tariffCard, i > 0 ? styles.tariffOverlap : null, { transform: [{ rotate: brandTilt[i % brandTilt.length] }] }]}>
          <View style={styles.tariffHead}>
            <AppText style={styles.tariffName}>{t.name}</AppText>
            <AppText style={[styles.tariffPrice, tabular]}>{t.price} ₼</AppText>
          </View>
          <View style={styles.tariffMeta}>
            {t.period ? (
              <>
                <ArrowCounterClockwise size={14} color={pillInk} />
                <AppText variant="caption" style={styles.brandSub}>
                  {t.period}
                </AppText>
              </>
            ) : (
              <>
                <Star size={14} color={colors.accentIcon} weight="fill" />
                <AppText variant="caption" style={styles.brandSub}>
                  {t.tagline}
                </AppText>
              </>
            )}
          </View>
          <View style={styles.tariffFeatures}>
            <View style={styles.cluster}>
              {t.socials.map((s, j) => (
                <View key={s} style={[styles.social, { backgroundColor: socials[s].color }, j > 0 ? { marginLeft: -7 } : null]}>
                  {socials[s].icon}
                </View>
              ))}
            </View>
            {t.features.map((feature) => (
              <Pill key={feature.label} tone="outline" label={feature.label} icon={featureIcons[feature.kind]} style={styles.tariffPill} />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

/** Fixed star field [x %, y %, size px, opacity] for the Hot offers background; no randomness so every render matches. */
const stars = Array.from({ length: 44 }, (_, i) => ({
  x: ((i * 0.618034) % 1) * 100,
  y: ((i * 0.754878 + 0.3) % 1) * 100,
  size: i % 4 === 0 ? 2 : 1.5,
  opacity: 0.3 + (i % 5) * 0.12,
}));

function Stars() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {stars.map((s) => (
        <View
          key={`${s.x}-${s.y}`}
          style={{ position: 'absolute', left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size, borderRadius: s.size, backgroundColor: colors.text, opacity: s.opacity }}
        />
      ))}
    </View>
  );
}

const GIFT_SIZE = 96;
/** Gift box timings from the recording: it pops in 1.8 s after the page starts and shrinks away at 4.3 s. */
const GIFT_IN_MS = 1800;
const GIFT_OUT_MS = 4300;

/** Gift box under the wheel: scale 0, 1.12, 1, hold, then 0 again. The timers run on the UI thread and stop on unmount. */
function GiftPop({ source }: { source: number }) {
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(
      GIFT_IN_MS,
      withSequence(
        withTiming(1.12, { duration: 260 }),
        withTiming(1, { duration: 160 }),
        withDelay(GIFT_OUT_MS - GIFT_IN_MS - 420, withTiming(0, { duration: 300 })),
      ),
    );
    return () => cancelAnimation(scale);
  }, [scale]);

  const pop = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View pointerEvents="none" style={[styles.gift, pop]}>
      <Image source={source} style={styles.giftImage} contentFit="contain" />
    </Animated.View>
  );
}

type ViewProps = {
  story: Story;
  page: number;
  /** Width style of the active segment; a frozen or empty bar on the faces of the cube. */
  fill: ComponentProps<typeof Animated.View>['style'];
  insets: EdgeInsets;
  /** Hold to pause, tap left or right, drag to turn the cube. Only the live face gets it. */
  gesture?: PanGesture;
  onClose: () => void;
  onCta: (page: StoryPage) => void;
};

/** One story: segmented progress, header, the page body, tap zones and the CTA. */
function StoryView({ story, page, fill, insets, gesture, onClose, onCta }: ViewProps) {
  const current = story.pages[Math.min(page, story.pages.length - 1)];
  const fillsHeight = Boolean(current.image) || Boolean(current.art && !current.artHeight);
  const art = current.art ? (
    <Image
      source={current.art}
      style={current.artHeight ? [styles.artFixed, { height: current.artHeight }] : styles.art}
      contentFit="contain"
      contentPosition={current.artAlign ?? 'top'}
    />
  ) : null;

  return (
    <LinearGradient colors={current.gradient} {...(current.horizontal ? sideways : diagonal)} style={styles.root}>
      {current.photo ? <Image source={current.photo} style={styles.photo} contentFit="cover" /> : null}
      {current.tariffCards ? <Stars /> : null}
      <View style={[styles.frame, { paddingTop: Math.max(insets.top, 14) + 8, paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
        <View style={styles.segments} accessibilityLabel={`Page ${page + 1} of ${story.pages.length}`}>
          {story.pages.map((_, i) => (
            <View key={i} style={styles.track}>
              {i < page ? <View style={[styles.fill, { width: '100%' }]} /> : null}
              {i === page ? <Animated.View style={[styles.fill, fill]} /> : null}
            </View>
          ))}
        </View>
        <View style={styles.head}>
          <Image source={story.thumb} style={styles.thumb} contentFit="cover" />
          <AppText variant="caption" style={{ flex: 1 }}>
            {story.title}
          </AppText>
          <Tap hitSlop={12} haptic={false} accessibilityRole="button" accessibilityLabel="Close" onPress={onClose}>
            <X size={22} color={colors.text} weight="regular" />
          </Tap>
        </View>

        <Animated.View key={page} entering={FadeIn.duration(260)} style={styles.body}>
          {current.kicker ? (
            <LinearGradient colors={['#5C7CF5', '#8A5CF0']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.kicker}>
              <AppText style={styles.kickerText}>{current.kicker}</AppText>
            </LinearGradient>
          ) : null}
          <AppText style={styles.title}>{current.title}</AppText>
          {current.subtitle ? (
            <View style={styles.subtitleRow}>
              {current.hot ? <Fire size={16} color={colors.orange} weight="fill" /> : null}
              <AppText style={[styles.subtitle, current.subtitle2 ? styles.subtitleBold : null]}>{current.subtitle}</AppText>
            </View>
          ) : null}
          {current.subtitle2 ? <AppText style={styles.subtitle2}>{current.subtitle2}</AppText> : null}
          {current.image ? <Image source={current.image} style={styles.image} contentFit="contain" /> : null}
          {current.artPosition !== 'below' ? art : null}
          {current.gift ? <GiftPop source={current.gift} /> : null}
          {current.caption ? <AppText style={styles.caption}>{current.caption}</AppText> : null}
          {current.items ? (
            current.grouped ? (
              <View style={[styles.group, current.photo ? styles.lower : null]}>
                {current.items.map((it, i) => (
                  <View key={it.title + it.sub} style={[styles.groupRow, i > 0 ? styles.divider : null]}>
                    <ItemContent it={it} />
                  </View>
                ))}
              </View>
            ) : (
              <View style={[styles.list, current.photo ? styles.lower : null]}>
                {current.items.map((it) => (
                  <View key={it.title + it.sub} style={styles.item}>
                    <ItemContent it={it} />
                  </View>
                ))}
              </View>
            )
          ) : null}
          {current.tariffCards ? <TariffCards /> : null}
          {current.brands ? (
            current.grouped ? (
              <View style={styles.group}>
                {current.brands.map((b, i) => (
                  <View key={b.name} style={[styles.groupRow, i > 0 ? styles.divider : null]}>
                    <BrandContent brand={b} grouped />
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.stagger}>
                {current.brands.map((b, i) => (
                  <View
                    key={b.name}
                    style={[styles.brandCard, { alignSelf: i % 2 ? 'flex-end' : 'flex-start', transform: [{ rotate: brandTilt[i % brandTilt.length] }] }]}>
                    <BrandContent brand={b} />
                  </View>
                ))}
              </View>
            )
          ) : null}
          {current.bullets ? (
            <View style={styles.stagger}>
              {current.bullets.map((b, i) => {
                const mirrored = i % 2 === 1;
                const Icon = b.icon ? icons[b.icon] : null;
                return (
                  <View
                    key={b.text}
                    style={[styles.bullet, { flexDirection: mirrored ? 'row-reverse' : 'row', transform: [{ rotate: bulletTilt[i % bulletTilt.length] }] }]}>
                    <View style={[styles.circle, { backgroundColor: b.monogram?.color ?? b.color ?? colors.accent }]}>
                      {b.monogram ? <AppText style={styles.monogram}>{b.monogram.label}</AppText> : null}
                      {Icon ? <Icon size={24} color={colors.text} weight="regular" /> : null}
                    </View>
                    <AppText style={[styles.bulletText, { textAlign: mirrored ? 'right' : 'left' }]}>{b.text}</AppText>
                  </View>
                );
              })}
            </View>
          ) : null}
          {current.rows ? (
            <View style={styles.rows}>
              {current.rows.map((r) => {
                const Icon = icons[r.icon];
                return (
                  <View key={r.text} style={styles.row}>
                    <View style={[styles.circle, { backgroundColor: colors.accent }]}>
                      <Icon size={24} color={colors.text} weight="regular" />
                    </View>
                    <AppText variant="bodySemibold" style={styles.rowText}>
                      {r.text}
                    </AppText>
                  </View>
                );
              })}
            </View>
          ) : null}
          {fillsHeight ? null : <View style={{ flex: 1 }} />}
          {current.artPosition === 'below' ? art : null}
        </Animated.View>

        {/* gesture area: tap left third for previous, elsewhere for next; hold to pause; drag sideways to turn */}
        {gesture ? (
          <GestureDetector gesture={gesture}>
            <View style={styles.zones} accessibilityLabel="Story controls" />
          </GestureDetector>
        ) : null}

        <Button label={current.cta} size="lg" onPress={() => onCta(current)} style={{ marginTop: 12 }} />
      </View>
    </LinearGradient>
  );
}

/** Stories open in the order of the Home shelf and turn like a cube from one to the next. */
const sequence = homeStories.map((s) => s.key).filter((k) => Boolean(stories[k]));

/** A neighbour the server names only counts when this build has a layout for it. */
const known = (k: string | null | undefined) => (k && stories[k] ? k : null);

/** The local story with the server's texts laid over it; the local copy shows until the answer arrives. */
function useStory(key: string | null) {
  const { data } = useQuery(key ? `content/stories/${key}/` : null, () => getStory(key ?? ''));
  const local = key ? stories[key] : undefined;
  const story = useMemo(() => (local ? withApiStory(local, data) : undefined), [local, data]);
  return { remote: data, story };
}

type Turn = { to: string; dir: 1 | -1 };

/** A press shorter than this with no movement is a tap; anything longer is a hold that pauses the clock. */
const TAP_MS = 260;
/** A drag released past this share of the width (or flung) completes the turn. */
const COMPLETE_AT = 0.35;
const FLING = 500;

/**
 * Full-screen story viewer. Pages auto-advance; a story's last page cube-turns into the next story.
 * The finger drives the cube directly while dragging, a hold pauses the clock, a tap moves a page.
 */
export default function StoryScreen() {
  const { key } = useLocalSearchParams<{ key: string }>();
  const router = useRouter();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const { markViewed } = useStories();
  const { width } = useWindowDimensions();
  const w = Math.min(width, layout.maxWidth);

  const [cur, setCur] = useState<string>(() => (key && stories[key] ? key : sequence[0]));
  const [page, setPage] = useState(0);
  const [turn, setTurn] = useState<Turn | null>(null);
  const clock = useSharedValue(0);
  const cube = useSharedValue(0);
  const way = useSharedValue<1 | -1>(1);
  const beganAt = useSharedValue(0);
  const dragging = useSharedValue(false);
  const pendingTo = useSharedValue('');
  const reach = useSharedValue({ prev: false, next: false });
  // Shared values are driven through a ref so handlers and worklets never capture them as frozen hook arguments.
  const sv = useRef({ clock, cube, way, beganAt, dragging, pendingTo, reach });
  const current = useStory(cur);
  const story = current.story ?? stories[cur];
  const index = sequence.indexOf(cur);
  // The server names the neighbours; one this build cannot show falls back to the recorded order.
  const nextKey = (current.remote && known(current.remote.next_key)) ?? known(sequence[index + 1]);
  const prevKey = (current.remote && known(current.remote.prev_key)) ?? known(sequence[index - 1]);
  // Fetching the neighbours ahead of the turn lets the incoming face already carry the server texts.
  const nextStory = useStory(nextKey);
  const prevStory = useStory(prevKey);
  const nav = useRef({ prev: prevKey, next: nextKey });
  const pageMs = useRef(PAGE_MS);

  useEffect(() => {
    markViewed(cur);
  }, [cur, markViewed]);

  useEffect(() => {
    nav.current = { prev: prevKey, next: nextKey };
    sv.current.reach.value = { prev: prevKey !== null, next: nextKey !== null };
  }, [prevKey, nextKey]);

  // Read when a clock starts or resumes, so a late answer never restarts a page that is already running.
  useEffect(() => {
    pageMs.current = story.pages[Math.min(page, story.pages.length - 1)].durationMs ?? PAGE_MS;
  }, [story, page]);

  const close = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }, [router]);

  const advanceRef = useRef<() => void>(() => {});
  const onTimerDone = useCallback(() => advanceRef.current(), []);

  useEffect(() => {
    const { clock: c } = sv.current;
    c.value = 0;
    c.value = withTiming(1, { duration: pageMs.current, easing: Easing.linear }, (finished) => {
      if (finished) runOnJS(onTimerDone)();
    });
    return () => cancelAnimation(c);
  }, [cur, page, onTimerDone]);

  const pauseClock = useCallback(() => cancelAnimation(sv.current.clock), []);
  const resumeClock = useCallback(() => {
    const { clock: c } = sv.current;
    const left = 1 - c.value;
    if (left <= 0) return;
    c.value = withTiming(1, { duration: left * pageMs.current, easing: Easing.linear }, (finished) => {
      if (finished) runOnJS(onTimerDone)();
    });
  }, [onTimerDone]);

  const finishTurn = useCallback((to: string) => {
    const s = sv.current;
    s.pendingTo.value = '';
    s.cube.value = 0;
    setCur(to);
    setPage(0);
    setTurn(null);
  }, []);

  /** A drag that springs back stays on the same page and restarts its clock from the beginning. */
  const restartClock = useCallback(() => {
    const { clock: c } = sv.current;
    cancelAnimation(c);
    c.value = 0;
    c.value = withTiming(1, { duration: pageMs.current, easing: Easing.linear }, (finished) => {
      if (finished) runOnJS(onTimerDone)();
    });
  }, [onTimerDone]);

  const cancelTurn = useCallback(() => {
    sv.current.pendingTo.value = '';
    setTurn(null);
    restartClock();
  }, [restartClock]);

  /** Prepares a turn towards the neighbouring story; the caller drives the cube. */
  const openTurn = useCallback(
    (step: 1 | -1): string | null => {
      const to = step === 1 ? nav.current.next : nav.current.prev;
      if (!to) return null;
      pauseClock();
      const s = sv.current;
      s.way.value = step;
      s.pendingTo.value = to;
      setTurn({ to, dir: step });
      return to;
    },
    [pauseClock],
  );

  const goToStory = useCallback(
    (step: 1 | -1) => {
      const to = openTurn(step);
      if (!to) {
        close();
        return;
      }
      const { cube: c } = sv.current;
      c.value = 0;
      c.value = withTiming(1, { duration: CUBE_MS, easing: Easing.out(Easing.quad) }, (finished) => {
        if (finished) runOnJS(finishTurn)(to);
      });
    },
    [openTurn, close, finishTurn],
  );

  const advance = useCallback(() => {
    if (turn) return;
    if (page < story.pages.length - 1) setPage(page + 1);
    else goToStory(1);
  }, [turn, page, story.pages.length, goToStory]);

  const back = useCallback(() => {
    if (turn) return;
    if (page > 0) setPage(page - 1);
    else goToStory(-1);
  }, [turn, page, goToStory]);

  useEffect(() => {
    advanceRef.current = advance;
  }, [advance]);

  const tapAt = useCallback(
    (x: number) => {
      if (x < w / 3) back();
      else advance();
    },
    [w, back, advance],
  );

  const dragStarted = useCallback(
    (step: 1 | -1) => {
      if (turn) return;
      openTurn(step);
    },
    [turn, openTurn],
  );

  /* eslint-disable react-hooks/refs, react-hooks/purity -- the gesture callbacks are worklets that run on the UI thread on touch, never during render */
  const pan = useMemo(() => Gesture.Pan()
    .activeOffsetX([-8, 8])
    .onBegin(() => {
      'worklet';
      const s = sv.current;
      s.beganAt.value = Date.now();
      s.dragging.value = false;
      runOnJS(pauseClock)();
    })
    .onUpdate((e) => {
      'worklet';
      const s = sv.current;
      if (!s.dragging.value) {
        if (Math.abs(e.translationX) < 4) return; // the activation event can carry no translation yet
        const step: 1 | -1 = e.translationX < 0 ? 1 : -1;
        const can = step === 1 ? s.reach.value.next : s.reach.value.prev;
        if (!can) return;
        s.dragging.value = true;
        s.way.value = step;
        runOnJS(dragStarted)(step);
      }
      const p = (-s.way.value * e.translationX) / w;
      s.cube.value = Math.min(1, Math.max(0, p));
    })
    .onFinalize((e) => {
      'worklet';
      const s = sv.current;
      if (s.dragging.value) {
        s.dragging.value = false;
        const to = s.pendingTo.value;
        const fling = s.way.value === 1 ? e.velocityX < -FLING : e.velocityX > FLING;
        if (to && (s.cube.value > COMPLETE_AT || fling)) {
          s.cube.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.quad) }, (finished) => {
            if (finished) runOnJS(finishTurn)(to);
          });
        } else {
          s.cube.value = withTiming(0, { duration: 180, easing: Easing.out(Easing.quad) }, (finished) => {
            if (finished) runOnJS(cancelTurn)();
          });
        }
        return;
      }
      if (Date.now() - s.beganAt.value < TAP_MS) runOnJS(tapAt)(e.x);
      else runOnJS(resumeClock)();
    }), [w, pauseClock, resumeClock, dragStarted, finishTurn, cancelTurn, tapAt]);
  /* eslint-enable react-hooks/refs, react-hooks/purity */

  const fill = useAnimatedStyle(() => ({ width: `${clock.value * 100}%` }));

  // Cube: the outgoing face pivots on the edge it leaves through, the incoming face on the edge it enters by.
  const outgoing = useAnimatedStyle(() => {
    const p = cube.value;
    const d = way.value;
    return {
      opacity: 1 - p * 0.4,
      transform: [
        { perspective: 1000 },
        { translateX: -d * w * p },
        { translateX: (d * w) / 2 },
        { rotateY: `${-d * 90 * p}deg` },
        { translateX: (-d * w) / 2 },
      ],
    };
  });
  const incoming = useAnimatedStyle(() => {
    const q = 1 - cube.value;
    const d = way.value;
    return {
      opacity: 1 - q * 0.4,
      transform: [
        { perspective: 1000 },
        { translateX: d * w * q },
        { translateX: (-d * w) / 2 },
        { rotateY: `${d * 90 * q}deg` },
        { translateX: (d * w) / 2 },
      ],
    };
  });

  const onCta = (target: StoryPage) => {
    if (target.href) router.push(target.href as Href);
    else toast(target.note);
  };
  const incomingStory = turn ? ((turn.to === nextKey ? nextStory.story : prevStory.story) ?? stories[turn.to]) : null;

  return (
    <View style={styles.stage}>
      <Animated.View style={[StyleSheet.absoluteFill, outgoing]}>
        <StoryView story={story} page={page} fill={fill} insets={insets} gesture={pan} onClose={close} onCta={onCta} />
      </Animated.View>
      {turn && incomingStory ? (
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, incoming]}>
          <StoryView story={incomingStory} page={0} fill={styles.empty} insets={insets} onClose={close} onCta={onCta} />
        </Animated.View>
      ) : null}
    </View>
  );
}

const glass = 'rgba(255,255,255,0.22)';

const styles = StyleSheet.create({
  stage: { flex: 1, backgroundColor: '#07040F' },
  root: { flex: 1 },
  photo: { position: 'absolute', left: 0, right: 0, bottom: 0, top: '36%' },
  frame: { flex: 1, alignSelf: 'center', width: '100%', maxWidth: layout.maxWidth, paddingHorizontal: layout.gutter },
  segments: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  track: { flex: 1, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.35)', overflow: 'hidden' },
  fill: { height: 3, borderRadius: 2, backgroundColor: colors.text },
  empty: { width: '0%' },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 36 },
  thumb: { width: 26, height: 26, borderRadius: 8 },
  body: { flex: 1, alignItems: 'center', paddingTop: 18 },
  kicker: { borderRadius: radius.pill, paddingHorizontal: 16, paddingVertical: 8, marginBottom: 16 },
  kickerText: { fontFamily: font.bold, fontSize: 18, lineHeight: 22, color: colors.text },
  title: { fontFamily: font.bold, fontSize: 30, lineHeight: 36, letterSpacing: -0.5, color: colors.text, textAlign: 'center' },
  subtitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, paddingHorizontal: 8 },
  subtitle: { fontFamily: font.regular, fontSize: 16, lineHeight: 22, color: 'rgba(255,255,255,0.92)', textAlign: 'center', flexShrink: 1 },
  subtitleBold: { fontFamily: font.bold, color: colors.text },
  subtitle2: { fontFamily: font.regular, fontSize: 16, lineHeight: 22, color: 'rgba(255,255,255,0.92)', textAlign: 'center', marginTop: 2 },
  image: { flex: 1, width: '100%', marginVertical: 16 },
  art: { flex: 1, width: '100%', marginVertical: 16 },
  artFixed: { width: '50%', alignSelf: 'flex-start', marginLeft: 20, marginTop: -2 },
  caption: { fontFamily: font.bold, fontSize: 17, lineHeight: 23, color: colors.text, textAlign: 'center', paddingHorizontal: 8, marginBottom: 12 },
  list: { width: '100%', gap: 10, marginTop: 22 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  price: { backgroundColor: colors.accent, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 6 },
  priceText: { fontFamily: font.semibold, fontSize: 14, lineHeight: 18, color: colors.text },
  group: { width: '86%', marginTop: 32, borderRadius: radius.xl, backgroundColor: glass, paddingHorizontal: 20 },
  groupRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 16 },
  divider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(255,255,255,0.35)' },
  stagger: { width: '100%', gap: 4, marginTop: 40 },
  brandCard: {
    width: '82%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: glass,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  tile: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  tileText: { fontFamily: font.bold, fontSize: 15, lineHeight: 20 },
  brandSub: { color: 'rgba(255,255,255,0.78)' },
  brandPrice: { fontFamily: font.bold, fontSize: 18, lineHeight: 22, color: colors.text },
  bullet: {
    width: '88%',
    alignSelf: 'center',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    backgroundColor: glass,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  bulletText: { flex: 1, fontFamily: font.regular, fontSize: 17, lineHeight: 26, color: colors.text },
  circle: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  monogram: { fontFamily: font.bold, fontSize: 11, lineHeight: 14, color: colors.text },
  rows: { width: '88%', gap: 10, marginTop: 26 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    backgroundColor: glass,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  rowText: { flex: 1, fontSize: 17, lineHeight: 23 },
  lower: { marginTop: 44 },
  tariffs: { width: '100%', marginTop: 28 },
  tariffCard: { width: '100%', backgroundColor: glass, borderRadius: 20, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 16 },
  tariffOverlap: { marginTop: -10 },
  tariffHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tariffName: { fontFamily: font.medium, fontSize: 18, lineHeight: 24, color: colors.text },
  tariffPrice: { fontFamily: font.bold, fontSize: 22, lineHeight: 28, color: colors.text },
  tariffMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  tariffFeatures: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginTop: 12 },
  tariffPill: { borderColor: 'rgba(255,255,255,0.5)' },
  cluster: { flexDirection: 'row', alignItems: 'center', marginRight: 4 },
  social: { width: 22, height: 22, borderRadius: 11, borderWidth: 1, borderColor: 'rgba(20,10,50,0.35)', alignItems: 'center', justifyContent: 'center' },
  gift: { width: GIFT_SIZE, height: GIFT_SIZE, marginBottom: 4 },
  giftImage: { width: '100%', height: '100%' },
  zones: { position: 'absolute', top: 110, bottom: 96, left: 0, right: 0, flexDirection: 'row' },
});
