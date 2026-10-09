import * as Haptics from 'expo-haptics';
import { Platform, Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

type Props = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
  /** Scale applied while pressed. */
  pressScale?: number;
  haptic?: boolean;
};

/** Pressable with a physical push (scale) and a light haptic tick on native. */
export function Tap({ style, pressScale = 0.97, haptic = true, onPress, disabled, ...rest }: Props) {
  return (
    <Pressable
      {...rest}
      disabled={disabled}
      onPress={(e) => {
        if (haptic && Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        }
        onPress?.(e);
      }}
      style={({ pressed }) => [
        style,
        pressed && !disabled ? { transform: [{ scale: pressScale }], opacity: 0.92 } : null,
      ]}
    />
  );
}
