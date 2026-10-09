import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Microphone } from '@/components/icons';
import { NavHeader } from '@/components/NavHeader';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { img } from '@/data/assets';
import { clock, dayLabel, pastConversations, type Conversation } from '@/data/conversations';
import { surface } from '@/data/notifications';
import { useAysel } from '@/state/aysel';
import { colors, headerGradient, layout, radius } from '@/theme/tokens';

const SHEET_RADIUS = 20;

/** One talk with AIsel as bubbles: the user on the right, AIsel on the left with its face. */
export default function ConversationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { messages } = useAysel();

  const live: Conversation | null = messages.length
    ? { id: 'live', startedAt: new Date(messages[0].id).toISOString(), turns: messages.map((m) => ({ role: m.role, text: m.text, at: new Date(m.id).toISOString() })) }
    : null;
  const conversation = (id === 'live' ? live : pastConversations.find((c) => c.id === id)) ?? pastConversations[0];
  const title = `${dayLabel(conversation.startedAt)}, ${clock(conversation.startedAt)}`;

  return (
    <View style={{ flex: 1, backgroundColor: surface }}>
      <LinearGradient colors={headerGradient} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={{ paddingTop: Math.max(insets.top, 14), paddingBottom: SHEET_RADIUS + 3 }}>
        <View style={{ paddingHorizontal: layout.gutter }}>
          <NavHeader title="AIsel" subtitle={title} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.body} contentContainerStyle={{ paddingHorizontal: layout.gutter, paddingTop: 22, paddingBottom: insets.bottom + 100, gap: 12 }} showsVerticalScrollIndicator={false}>
        {conversation.turns.map((t, i) => (
          <View key={i} style={[styles.line, t.role === 'user' ? styles.lineUser : styles.lineAysel]}>
            {t.role === 'aysel' ? <Image source={img.avatarRobotIdleHd} style={styles.avatar} contentFit="cover" /> : null}
            <View style={[styles.bubble, t.role === 'user' ? styles.bubbleUser : styles.bubbleAysel]}>
              <AppText variant="body" style={{ fontSize: 15, lineHeight: 21 }}>
                {t.text}
              </AppText>
              <AppText variant="small" tone={t.role === 'user' ? 'onHeaderSecondary' : 'tertiary'} style={{ marginTop: 4, alignSelf: 'flex-end' }}>
                {clock(t.at)}
              </AppText>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
        <Button label="Continue with voice" size="lg" icon={<Microphone size={20} color={colors.text} weight="fill" />} onPress={() => router.push('/aysel')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, marginTop: -SHEET_RADIUS, borderTopLeftRadius: SHEET_RADIUS, borderTopRightRadius: SHEET_RADIUS, backgroundColor: surface },
  line: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  lineUser: { justifyContent: 'flex-end' },
  lineAysel: { justifyContent: 'flex-start' },
  avatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.accent },
  bubble: { maxWidth: '78%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: radius.lg },
  bubbleUser: { backgroundColor: colors.accent, borderBottomRightRadius: 6 },
  bubbleAysel: { backgroundColor: colors.card, borderBottomLeftRadius: 6 },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: layout.gutter, paddingTop: 12, backgroundColor: surface },
});
