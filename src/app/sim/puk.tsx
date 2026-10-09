import { StyleSheet, Text, View } from 'react-native';

import { useQuery } from '@/api/query';
import { getPuk } from '@/api/sim';
import { NavHeader } from '@/components/NavHeader';
import { Screen } from '@/components/Screen';
import { AppText, tabular } from '@/components/ui/AppText';
import { surface } from '@/data/notifications';
import { pukCodes, pukCopy } from '@/data/simServices';
import { colors, font, radius } from '@/theme/tokens';

export default function PukCodesScreen() {
  const puk = useQuery('sim/puk/', getPuk).data;
  const paragraphs = puk?.paragraphs ?? pukCopy.paragraphs;
  const codes = puk?.codes ?? pukCodes;
  return (
    <Screen backgroundColor={surface}>
      <NavHeader title={pukCopy.title} subtitle={null} />
      <View style={{ paddingTop: 14 }}>
        <AppText variant="heading" style={{ fontSize: 20 }}>
          {pukCopy.heading}
        </AppText>
        {paragraphs.map((segments, i) => (
          <AppText key={i} variant="body" style={[styles.paragraph, { marginTop: i === 0 ? 10 : 18 }]}>
            {segments.map((s, j) => (
              <Text key={j} style={s.bold ? { fontFamily: font.bold } : undefined}>
                {s.text}
              </Text>
            ))}
          </AppText>
        ))}
        <View style={styles.codes}>
          {codes.map((c) => (
            <View key={c.label} style={styles.box}>
              <AppText variant="small" tone="secondary" style={{ fontSize: 13 }}>
                {c.label}
              </AppText>
              <AppText variant="bodySemibold" style={[{ fontSize: 16, lineHeight: 20 }, tabular]}>
                {c.value}
              </AppText>
            </View>
          ))}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  paragraph: { fontSize: 15, lineHeight: 19 },
  codes: { flexDirection: 'row', gap: 8, marginTop: 22 },
  box: { flex: 1, backgroundColor: colors.cardRaised, borderRadius: radius.md, paddingHorizontal: 16, paddingVertical: 11 },
});
