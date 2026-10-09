import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Svg, { Line, Path } from 'react-native-svg';

import { CaretRight } from '@/components/icons';
import { AppText } from '@/components/ui/AppText';
import { Tap } from '@/components/ui/Tap';
import { img } from '@/data/assets';
import { colors, font, layout, lotteryGradient, radius } from '@/theme/tokens';

const CORNER = radius.md;
const STRIP = 44;
/** Tear line: 2.7pt dots at a 5.4pt period, inset 18pt from each edge, measured from the recording. */
const TEAR_INSET = 18;
const DOT = 2.7;
/** Sparkle positions sampled from the reference artwork (fractions of the panel). */
const SPARKLES: { x: number; y: number; s: number }[] = [
  { x: 0.075, y: 0.16, s: 2 },
  { x: 0.264, y: 0.298, s: 3 },
  { x: 0.909, y: 0.323, s: 2 },
  { x: 0.938, y: 0.403, s: 3 },
  { x: 0.78, y: 0.532, s: 2 },
  { x: 0.931, y: 0.637, s: 2 },
  { x: 0.076, y: 0.903, s: 2 },
];

function Sparkle({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const k = r * 0.16; // thin four-point star, as in the artwork
  return (
    <Path
      d={`M ${cx} ${cy - r} Q ${cx + k} ${cy - k} ${cx + r} ${cy} Q ${cx + k} ${cy + k} ${cx} ${cy + r} Q ${cx - k} ${cy + k} ${cx - r} ${cy} Q ${cx - k} ${cy - k} ${cx} ${cy - r} Z`}
      fill="#FFFFFF"
      opacity={0.85}
    />
  );
}

/**
 * "30 il səninlə" lottery promo as a ticket: a code-drawn artwork panel (gradient, light rays,
 * sparkles, the script mark and the date line) and the "Learn more" strip, two rounded panels
 * meeting along a dotted tear line with notches where their corners touch.
 */
const DEFAULT_SUBTITLE = 'Chance collection starts on 19 October 2026';

export function LotteryBanner({ subtitle = DEFAULT_SUBTITLE }: { subtitle?: string } = {}) {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const w = Math.min(width, layout.maxWidth) - layout.gutter * 2;
  const h = Math.round((w * 124) / 550);
  const tearW = w - TEAR_INSET * 2;
  return (
    <View>
      <View
        style={[styles.art, { width: w, height: h }]}
        accessibilityRole="image"
        accessibilityLabel={`30 il səninlə. ${subtitle}`}>
        <LinearGradient colors={['#7D28B4', '#9834BA', '#BD44C3']} locations={[0, 0.5, 1]} style={StyleSheet.absoluteFill} />
        <LinearGradient
          colors={['rgba(181,97,211,0)', 'rgba(181,97,211,0.9)', 'rgba(185,100,212,0.9)', 'rgba(181,97,211,0)']}
          locations={[0.02, 0.34, 0.62, 0.98]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
        <Svg pointerEvents="none" width={w} height={h} style={StyleSheet.absoluteFill}>
          {SPARKLES.map((p, i) => (
            <Sparkle key={i} cx={p.x * w} cy={p.y * h} r={p.s === 3 ? 4 : 2.8} />
          ))}
        </Svg>
        <Image source={img.lotteryLogo} style={[styles.logo, { top: h * 0.21, left: w * 0.052, width: w * 0.168, height: (w * 0.168) / 2.6 }]} contentFit="contain" />
        <AppText style={[styles.date, { left: w * 0.062, top: h * 0.64 }]}>{subtitle}</AppText>
      </View>
      <Tap
        onPress={() => router.push('/lottery-rules')}
        pressScale={0.99}
        accessibilityRole="button"
        accessibilityLabel="Learn more about the lottery">
        <LinearGradient colors={lotteryGradient} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.strip}>
          <AppText variant="body">Learn more about the lottery</AppText>
          <CaretRight size={18} color={colors.text} weight="bold" />
        </LinearGradient>
      </Tap>
      {/* drawn as SVG and straddling the seam: a dotted border alone does not render on iOS or Android */}
      <Svg pointerEvents="none" width={tearW} height={DOT} style={[styles.tear, { top: h - DOT / 2 }]}>
        <Line x1={0} y1={DOT / 2} x2={tearW} y2={DOT / 2} stroke="#59238B" strokeOpacity={0.88} strokeWidth={DOT} strokeDasharray={`${DOT} ${DOT}`} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  art: { borderRadius: CORNER, overflow: 'hidden' },
  logo: { position: 'absolute' },
  date: { position: 'absolute', fontFamily: font.regular, fontSize: 14, lineHeight: 18, color: colors.text },
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    height: STRIP,
    borderRadius: CORNER,
    overflow: 'hidden',
  },
  tear: { position: 'absolute', left: TEAR_INSET },
});
