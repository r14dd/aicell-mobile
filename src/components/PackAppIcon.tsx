import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { FacebookLogo, InstagramLogo, MonitorPlay, TiktokLogo } from '@/components/icons';
import { AppText } from '@/components/ui/AppText';
import type { PackApp } from '@/data/internetPacks';
import { tariffSurface } from '@/data/myTariff';
import { colors, font } from '@/theme/tokens';

type DotProps = { size: number; color: string; children: ReactNode; style?: StyleProp<ViewStyle> };

function Dot({ size, color, children, style }: DotProps) {
  return <View style={[styles.dot, { width: size, height: size, borderRadius: size / 2, backgroundColor: color }, style]}>{children}</View>;
}

/** App badge of an internet pack: Teams monogram, Facebook + Instagram pair, TikTok or YouTube. */
export function PackAppIcon({ app, size = 22 }: { app?: PackApp; size?: number }) {
  const glyph = Math.round(size * 0.58);

  switch (app) {
    case 'teams':
      return (
        <Dot size={size} color="#5059C9">
          <AppText style={{ fontFamily: font.bold, fontSize: Math.round(size * 0.55), lineHeight: Math.round(size * 0.7), color: colors.text }}>T</AppText>
        </Dot>
      );
    case 'instagram-facebook':
      return (
        <View style={styles.pair}>
          <Dot size={size} color="#1877F2">
            <FacebookLogo size={glyph} color={colors.text} weight="fill" />
          </Dot>
          <Dot size={size} color="#E1306C" style={{ marginLeft: -Math.round(size * 0.3), borderWidth: 1.5, borderColor: tariffSurface }}>
            <InstagramLogo size={glyph} color={colors.text} weight="fill" />
          </Dot>
        </View>
      );
    case 'tiktok':
      return (
        <Dot size={size} color="#111111">
          <TiktokLogo size={glyph} color={colors.text} weight="fill" />
        </Dot>
      );
    case 'youtube':
      return (
        <Dot size={size} color="#FF0000">
          <MonitorPlay size={glyph} color={colors.text} weight="fill" />
        </Dot>
      );
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  dot: { alignItems: 'center', justifyContent: 'center' },
  pair: { flexDirection: 'row', alignItems: 'center' },
});
