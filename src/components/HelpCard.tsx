import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { useRouter } from 'expo-router';

import { useToast } from '@/components/Toast';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { img } from '@/data/assets';

/** "Any questions left?" block with AI Chat Bot and FAQ entry points. */
/** `color` lifts the card one step on the violet #231C2E pages, as the recordings show. */
export function HelpCard({ color }: { color?: string } = {}) {
  const toast = useToast();
  const router = useRouter();
  return (
    <Card color={color}>
      <AppText variant="bodyMedium" style={{ fontSize: 17 }}>
        Any questions left?
      </AppText>
      <AppText variant="small" tone="secondary" style={{ marginTop: 6 }}>
        Chat with our Azercell bot or explore FAQ for answers. Hope this clears everything up!
      </AppText>
      <View style={styles.actions}>
        <Button
          label="AI Chat Bot"
          variant="outline"
          size="md"
          icon={<Image source={img.avatarRobotHd} style={styles.bot} contentFit="cover" />}
          style={{ flex: 1.5 }}
          onPress={() => router.push('/support')}
        />
        <Button label="FAQ" variant="outline" size="md" style={{ flex: 1 }} onPress={() => toast('FAQ is not part of this prototype yet')} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: 12, marginTop: 16 },
  bot: { width: 26, height: 26, borderRadius: 13 },
});
