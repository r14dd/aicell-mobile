import { BlurView } from "expo-blur";
import { useEffect, useState, type ReactNode } from "react";
import { Modal, Platform, Pressable, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AyselBubble } from "@/components/aysel/Bubble";
import { X } from "@/components/icons";
import { LayaCursor } from "@/laya/cursor";
import { setLayaUi } from "@/laya/store";
import { AppText } from "@/components/ui/AppText";
import { Tap } from "@/components/ui/Tap";
import { colors, layout } from "@/theme/tokens";

type Props = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** Centered layout (rate prompt) instead of a left-aligned sheet. */
  centered?: boolean;
  /** Sheet colour; the default is the violet page surface. */
  surface?: string;
  /** Sheets whose buttons already dismiss them (logout confirmation) show no X. */
  hideClose?: boolean;
};

const EASE = Easing.out(Easing.cubic);

/** Bottom sheet over a blurred, dimmed page: slides up on open, slides down on close. */
export function Sheet({
  visible,
  onClose,
  title,
  children,
  centered,
  surface,
  hideClose,
}: Props) {
  const insets = useSafeAreaInsets();
  const [closed, setClosed] = useState(!visible);
  if (visible && closed) setClosed(false);
  const mounted = visible || !closed;
  const progress = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      progress.value = withTiming(1, { duration: 320, easing: EASE });
    } else if (mounted) {
      progress.value = withTiming(
        0,
        { duration: 220, easing: Easing.in(Easing.cubic) },
        (done) => {
          if (done) runOnJS(setClosed)(true);
        },
      );
    }
  }, [visible, mounted, progress]);

  // The sheet is its own window: while it shows, the docked bot lives inside it.
  useEffect(() => {
    if (!visible) return;
    setLayaUi({ host: "sheet" });
    return () => setLayaUi({ host: "root" });
  }, [visible]);

  const backdrop = useAnimatedStyle(() => ({ opacity: progress.value }));
  const card = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.value) * 420 }],
  }));

  if (!mounted) return null;

  return (
    <Modal
      transparent
      visible
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.root}>
        <Animated.View style={[StyleSheet.absoluteFill, backdrop]}>
          <BlurView
            intensity={Platform.OS === "android" ? 70 : 40}
            tint="dark"
            experimentalBlurMethod="dimezisBlurView"
            style={StyleSheet.absoluteFill}
          />
          <Pressable
            accessibilityLabel="Close"
            onPress={onClose}
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: "rgba(12,8,24,0.22)" },
            ]}
          />
        </Animated.View>
        <View style={styles.frame} pointerEvents="box-none">
          <Animated.View
            style={[
              styles.card,
              surface ? { backgroundColor: surface } : null,
              { paddingBottom: Math.max(insets.bottom, 16) + 8 },
              card,
            ]}
          >
            <View
              style={[styles.head, centered && { justifyContent: "flex-end" }]}
            >
              {title && !centered ? (
                <AppText
                  variant="bodySemibold"
                  style={{ fontSize: 17, flex: 1 }}
                >
                  {title}
                </AppText>
              ) : null}
              {hideClose ? null : (
                <Tap
                  hitSlop={10}
                  haptic={false}
                  accessibilityRole="button"
                  accessibilityLabel="Close"
                  onPress={onClose}
                >
                  <X size={22} color={colors.text} weight="regular" />
                </Tap>
              )}
            </View>
            {children}
          </Animated.View>
        </View>
      </View>
      <LayaCursor />
      <AyselBubble host="sheet" />
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: "flex-end" },
  frame: { alignSelf: "center", width: "100%", maxWidth: layout.maxWidth },
  card: {
    backgroundColor: "#231C2E",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: layout.gutter,
    paddingTop: 14,
  },
  head: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 32,
    marginBottom: 8,
  },
});
