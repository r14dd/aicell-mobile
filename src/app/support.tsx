import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, type Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState, type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChatCircle, ChatText, House, Lightbulb, PaperPlaneTilt, X } from '@/components/icons';
import { useToast } from '@/components/Toast';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Tap } from '@/components/ui/Tap';
import { createConversation, getInbox, sendMessage, type Inbox, type Reply } from '@/api/assistant';
import { errorMessage } from '@/api/client';
import { useQuery } from '@/api/query';
import { img } from '@/data/assets';
import { noOutline } from '@/theme/inputs';
import { colors, font, layout } from '@/theme/tokens';

const INK = '#1C1626';
const MUTED = '#6B6B7A';
const ALERT = '#E8445F';

const seed: Inbox = {
  greeting: 'How can we support you?',
  unread: 1,
  actions: [
    { key: 'ask', title: 'Ask a question', body: "We're here to help, just ask away!" },
    { key: 'ideas', title: 'Share your ideas for new features', body: 'Your feedback helps us improve!' },
  ],
  items: [{ id: 3513323, externalId: '#3513323', title: 'Rate your conversation', by: 'AI Chat Bot', ago: '3 days ago', unread: true }],
};

type Message = { from: 'me' | 'bot'; text: string; action?: Reply['action'] };

export default function SupportScreen() {
  const router = useRouter();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const soon = () => toast('Support messages are not part of this prototype yet');
  const { data } = useQuery('assistant/inbox/', getInbox, seed);
  const inbox = data ?? seed;

  const [asking, setAsking] = useState(false);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [thread, setThread] = useState<Message[]>([]);
  const conversation = useRef<number | null>(null);
  const scroller = useRef<ScrollView>(null);

  const send = async () => {
    const text = draft.trim();
    if (!text || busy) return;
    setDraft('');
    setBusy(true);
    setThread((t) => [...t, { from: 'me', text }]);
    try {
      if (conversation.current === null) conversation.current = (await createConversation()).id;
      const reply = await sendMessage(conversation.current, text);
      setThread((t) => [...t, { from: 'bot', text: reply.content, action: reply.action }]);
    } catch (e) {
      toast(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#5B2BC8', '#9C6CF0', '#FFFFFF']}
        locations={[0, 0.45, 1]}
        style={{ paddingTop: Math.max(insets.top, 14) + 8, paddingHorizontal: layout.gutter, paddingBottom: 28 }}>
        <View style={{ height: 48, flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Image source={img.avatarAzercell} style={{ width: 28, height: 28, borderRadius: 14 }} />
            <AppText style={{ fontFamily: font.semibold, fontSize: 18, color: '#FFFFFF' }}>Azercell</AppText>
          </View>
          <Tap
            hitSlop={12}
            haptic={false}
            accessibilityRole="button"
            accessibilityLabel="Close"
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}>
            <X size={24} color="#FFFFFF" />
          </Tap>
        </View>

        <AppText style={{ fontFamily: font.bold, fontSize: 28, lineHeight: 34, color: '#FFFFFF', marginTop: 28 }}>Hi 👋</AppText>
        <AppText style={{ fontFamily: font.semibold, fontSize: 22, lineHeight: 28, color: '#FFFFFF', marginTop: 4 }}>
          {inbox.greeting}
        </AppText>

        {asking ? null : (
          <View style={{ marginTop: 20, gap: 10 }}>
            {inbox.items.map((item) => (
              <Tap key={item.id} accessibilityRole="button" accessibilityLabel={item.title} onPress={soon} style={styles.card}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Image source={img.avatarRobotHd} style={{ width: 36, height: 36, borderRadius: 18 }} />
                  <View style={{ flex: 1 }}>
                    <AppText style={{ fontSize: 12, color: MUTED }}>{item.externalId}</AppText>
                    <AppText numberOfLines={1} style={{ fontFamily: font.medium, fontSize: 15, color: INK, marginTop: 2 }}>
                      {item.title}
                    </AppText>
                    <AppText style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{`${item.by} • ${item.ago}`}</AppText>
                  </View>
                  {item.unread ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: ALERT }} /> : null}
                </View>
              </Tap>
            ))}
            {inbox.actions.map((action) => (
              <ActionCard
                key={action.key}
                title={action.title}
                body={action.body}
                icon={action.key === 'ideas' ? <Lightbulb size={22} color="#F5B400" weight="fill" /> : <ChatCircle size={22} color={colors.accent} />}
                onPress={action.key === 'ask' ? () => setAsking(true) : soon}
              />
            ))}
          </View>
        )}
      </LinearGradient>

      {asking ? (
        <View style={{ flex: 1 }}>
          <ScrollView
            ref={scroller}
            style={{ flex: 1 }}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ padding: layout.gutter, gap: 10 }}
            onContentSizeChange={() => scroller.current?.scrollToEnd({ animated: true })}>
            {thread.map((m, i) => {
              const { action } = m;
              return m.from === 'me' ? (
                <View key={i} style={styles.mine}>
                  <AppText style={{ fontSize: 15, color: '#FFFFFF' }}>{m.text}</AppText>
                </View>
              ) : (
                <View key={i} style={[styles.card, styles.theirs]}>
                  <AppText style={{ fontSize: 15, color: INK }}>{m.text}</AppText>
                  {action ? <Button size="sm" label={action.label} onPress={() => router.push(action.to as Href)} style={{ marginTop: 12, alignSelf: 'flex-start' }} /> : null}
                </View>
              );
            })}
          </ScrollView>
          <View style={styles.composer}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              onSubmitEditing={() => void send()}
              editable={!busy}
              maxLength={2000}
              returnKeyType="send"
              accessibilityLabel="Your question"
              placeholder="Ask a question"
              placeholderTextColor={MUTED}
              selectionColor={colors.accent}
              style={styles.input}
            />
            <Tap hitSlop={10} accessibilityRole="button" accessibilityLabel="Send" onPress={() => void send()}>
              <PaperPlaneTilt size={26} color={draft.trim() && !busy ? colors.accent : MUTED} weight="fill" />
            </Tap>
          </View>
        </View>
      ) : (
        <View style={{ flex: 1 }} />
      )}

      <View
        style={{
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: '#E4E1EC',
          height: 64 + insets.bottom,
          paddingBottom: insets.bottom,
          flexDirection: 'row',
        }}>
        <Tap accessibilityRole="button" accessibilityLabel="Home" onPress={asking ? () => setAsking(false) : soon} style={styles.tab}>
          <House size={24} color={colors.accent} weight="fill" />
          <AppText style={{ fontSize: 12, color: colors.accent }}>Home</AppText>
        </Tap>
        <Tap accessibilityRole="button" accessibilityLabel={inbox.unread > 0 ? `Messages, ${inbox.unread} unread` : 'Messages'} onPress={soon} style={styles.tab}>
          <View>
            <ChatText size={24} color={MUTED} />
            {inbox.unread > 0 ? (
              <View style={styles.badge}>
                <AppText style={{ fontFamily: font.bold, fontSize: 10, lineHeight: 12, color: '#FFFFFF' }}>{inbox.unread}</AppText>
              </View>
            ) : null}
          </View>
          <AppText style={{ fontSize: 12, color: MUTED }}>Messages</AppText>
        </Tap>
      </View>
    </KeyboardAvoidingView>
  );
}

function ActionCard({ title, body, icon, onPress }: { title: string; body: string; icon: ReactNode; onPress: () => void }) {
  return (
    <Tap accessibilityRole="button" accessibilityLabel={title} onPress={onPress} style={[styles.card, { flexDirection: 'row', alignItems: 'center' }]}>
      <View style={{ flex: 1 }}>
        <AppText style={{ fontFamily: font.medium, fontSize: 15, color: INK }}>{title}</AppText>
        <AppText style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{body}</AppText>
      </View>
      {icon}
    </Tap>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#2A1A5E',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: ALERT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mine: { alignSelf: 'flex-end', maxWidth: '85%', backgroundColor: colors.accent, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  theirs: { alignSelf: 'flex-start', maxWidth: '90%' },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: layout.gutter,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E4E1EC',
  },
  input: { flex: 1, height: 44, borderRadius: 22, backgroundColor: '#F3F1F8', paddingHorizontal: 16, fontFamily: font.regular, fontSize: 15, color: INK, ...noOutline },
});
