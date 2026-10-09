import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Tap } from '@/components/ui/Tap';
import { colors } from '@/theme/tokens';

type Props = { label: string; image: number | { uri: string }; onPress?: () => void; size?: number; viewed?: boolean };

/** Story-style shortcut: rounded square artwork with a label below; a viewed story gets a dim ring. */
export function StoryChip({ label, image, onPress, size = 66, viewed }: Props) {
  return (
    <Tap onPress={onPress} accessibilityRole="button" accessibilityLabel={viewed ? `${label}, viewed` : label} style={[styles.wrap, { width: size + 8 }]}>
      <View style={[styles.frame, { width: size, height: size, borderRadius: 14, borderColor: viewed ? 'transparent' : colors.chipRing }]}>
        <Image source={image} style={StyleSheet.absoluteFill} contentFit="cover" />
      </View>
      <AppText variant="small" numberOfLines={2} style={styles.label}>
        {label}
      </AppText>
    </Tap>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  frame: { overflow: 'hidden', borderWidth: 1.5 },
  label: { marginTop: 10, textAlign: 'center', fontSize: 13, lineHeight: 17 },
});
