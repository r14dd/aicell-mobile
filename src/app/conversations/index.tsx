import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CaretRight, Microphone } from '@/components/icons';
import { NavHeader } from '@/components/NavHeader';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Divider } from '@/components/ui/Divider';
import { Tap } from '@/components/ui/Tap';
import { img } from '@/data/assets';
import { clock, dayLabel, pastConversations, type Conversation } from '@/data/conversations';
import { surface } from '@/data/notifications';
import { useAysel } from '@/state/aysel';
import { colors, headerGradient, layout } from '@/theme/tokens';

const SHEET_RADIUS = 20;

/** Talks with AIsel, newest first. The live session shows on top; the rest is UI-only history until the backend keeps it. */
export default function ConversationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { messages } = useAysel();

  const live: Conversation | null = messages.length
    ? { id: 'live', startedAt: new Date(messages[0].id).toISOString(), turns: messages.map((m) => ({ role: m.role, text: m.text, at: new Date(m.id).toISOString() })) }
    : null;
  const all = live ? [live, ...pastConversations] : pastConversations;
  const groups: { label: string; items: Conversation[] }[] = [];
  for (const c of all) {
    const label = dayLabel(c.startedAt);
    const last = groups[groups.length - 1];
    if (last?.label === label) last.items.push(c);
    else groups.push({ label, items: [c] });
  }

  return (
    <View style={{ flex: 1, backgroundColor: surface }}>
      <LinearGradient colors={headerGradient} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={{ paddingTop: Math.max(insets.top, 14), paddingBottom: SHEET_RADIUS + 3 }}>
        <View style={{ paddingHorizontal: layout.gutter }}>
          <NavHeader title="Conversations" subtitle={null} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.body} contentContainerStyle={{ paddingHorizontal: layout.gutter, paddingTop: 22, paddingBottom: insets.bottom + 100 }} showsVerticalScrollIndicator={false}>
        {groups.map((g) => (
          <View key={g.label} style={{ marginBottom: 22 }}>
            <AppText variant="caption" tone="secondary" style={{ marginBottom: 10 }}>
              {g.label}
            </AppText>
            <Card color={colors.card} padded={false}>
              {g.items.map((c, i) => {
                const first = c.turns.find((t) => t.role === 'user') ?? c.turns[0];
                const reply = [...c.turns].reverse().find((t) => t.role === 'aysel');
                return (
                  <View key={c.id}>
                    {i > 0 ? <Divider style={{ marginLeft: 70 }} /> : null}
                    <Tap accessibilityRole="button" accessibilityLabel={first.text} pressScale={0.99} onPress={() => router.push({ pathname: '/conversations/[id]', params: { id: c.id } })} style={styles.row}>
                      <Image source={img.avatarRobotIdleHd} style={styles.avatar} contentFit="cover" />
                      <View style={{ flex: 1 }}>
                        <AppText variant="bodyMedium" numberOfLines={1} style={{ fontSize: 16 }}>
                          {first.text}
                        </AppText>
                        <AppText variant="caption" tone="secondary" numberOfLines={1} style={{ marginTop: 3 }}>
                          {reply?.text ?? 'Davam edir…'}
                        </AppText>
                      </View>
                      <View style={styles.meta}>
                        <AppText variant="small" tone="tertiary">
                          {clock(c.startedAt)}
                        </AppText>
                        <CaretRight size={16} color={colors.textTertiary} />
                      </View>
                    </Tap>
                  </View>
                );
              })}
            </Card>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
        <Button label="Talk to AIsel" size="lg" icon={<Microphone size={20} color={colors.text} weight="fill" />} onPress={() => router.push('/aysel')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, marginTop: -SHEET_RADIUS, borderTopLeftRadius: SHEET_RADIUS, borderTopRightRadius: SHEET_RADIUS, backgroundColor: surface },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 14, paddingVertical: 13 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.accent },
  meta: { alignItems: 'flex-end', gap: 6 },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: layout.gutter, paddingTop: 12, backgroundColor: surface },
});
