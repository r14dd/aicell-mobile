import { StyleSheet, Text, View } from 'react-native';

import { CalendarBlank, Clock, Diamond, Gift, Info, Medal, Trophy, Users } from '@/components/icons';
import { NavHeader } from '@/components/NavHeader';
import { Screen } from '@/components/Screen';
import { useToast } from '@/components/Toast';
import { AppText, type TextTone } from '@/components/ui/AppText';
import { getLotterySections } from '@/api/lottery';
import { useQuery } from '@/api/query';
import { lotterySections, type LotteryBlock } from '@/data/lottery';
import { colors, font, radius } from '@/theme/tokens';

const icons = { Diamond, Clock, Trophy, Gift, Medal, Calendar: CalendarBlank, Users, Info };

// Both tints are sampled from the recording; the example box is lighter than any card token.
const BADGE_BG = '#A45EE6';
const EXAMPLE_BG = '#423953';

const body = { fontSize: 15, lineHeight: 24 } as const;
const lead = { ...body, fontFamily: font.semibold } as const;
const small = { fontSize: 14, lineHeight: 21 } as const;

function Bullet({
  text,
  col,
  padLeft,
  style,
  tone = 'primary',
}: {
  text: string;
  col: number;
  padLeft: number;
  style: typeof body | typeof small;
  tone?: TextTone;
}) {
  return (
    <View style={styles.row}>
      <View style={{ width: col }}>
        <AppText tone={tone} style={[style, { paddingLeft: padLeft }]}>
          {'•'}
        </AppText>
      </View>
      <AppText tone={tone} style={[style, { flex: 1 }]}>
        {text}
      </AppText>
    </View>
  );
}

function BlockView({ block, prev, onLink }: { block: LotteryBlock; prev?: LotteryBlock; onLink: () => void }) {
  const marginTop =
    !prev ? 0
    : block.kind === 'example' || block.kind === 'bullets' ? 14
    : prev.kind === 'example' ? 16
    : 24;

  switch (block.kind) {
    case 'p': {
      const text = (
        <AppText style={[body, { flex: 1 }]}>
          {block.bold ? <Text style={{ fontFamily: font.semibold }}>{block.bold}</Text> : null}
          {block.bold && block.text ? ' ' : ''}
          {block.text}
        </AppText>
      );
      if (!block.num) return <View style={{ marginTop }}>{text}</View>;
      return (
        <View style={[styles.row, { marginTop }]}>
          <AppText style={[lead, styles.num]}>{block.num}</AppText>
          {text}
        </View>
      );
    }
    case 'example':
      return (
        <View style={[styles.example, { marginTop }]}>
          <AppText style={small}>Example:</AppText>
          <View style={{ marginTop: 6 }}>
            {block.items.map((t) => (
              <Bullet key={t} text={t} col={24} padLeft={7} style={small} />
            ))}
          </View>
        </View>
      );
    case 'bullets':
      return (
        <View style={{ marginTop, gap: 6 }}>
          {block.items.map((t) => (
            <Bullet key={t} text={t} col={32} padLeft={9} style={body} />
          ))}
        </View>
      );
    case 'note':
      return (
        <View style={[styles.note, { marginTop }]}>
          {block.items.map((t) => (
            <Bullet key={t} text={t} col={17} padLeft={0} style={body} tone="accent" />
          ))}
        </View>
      );
    case 'link':
      return (
        <AppText style={[body, { marginTop }]}>
          {block.before}
          <AppText tone="info" style={body} accessibilityRole="link" onPress={onLink}>
            {block.link}
          </AppText>
          {block.after}
        </AppText>
      );
  }
}

export default function LotteryRulesScreen() {
  const toast = useToast();
  const { data: sections = lotterySections } = useQuery('content/lottery/rules/', getLotterySections, lotterySections);

  return (
    <Screen>
      <NavHeader title="Lottery rules & info" subtitle={null} />
      {sections.map((section, i) => {
        const Icon = section.icon ? icons[section.icon] : null;
        return (
          <View key={section.title} style={{ marginTop: i === 0 ? 8 : 30 }}>
            {Icon ? (
              <View style={styles.badge}>
                <Icon size={18} color={colors.text} weight="regular" />
              </View>
            ) : null}
            <AppText variant="bodySemibold" style={styles.heading}>
              {section.title}
            </AppText>
            {section.blocks.map((block, j) => (
              <BlockView
                key={`${section.title}-${j}`}
                block={block}
                prev={section.blocks[j - 1]}
                onLink={() => toast('The lottery terms link is not part of this prototype yet')}
              />
            ))}
          </View>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BADGE_BG,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  heading: { fontSize: 17, lineHeight: 24, marginBottom: 18 },
  num: { width: 24, paddingLeft: 5 },
  example: { marginLeft: 20, backgroundColor: EXAMPLE_BG, borderRadius: radius.sm, padding: 14 },
  note: { backgroundColor: colors.noteBg, borderRadius: radius.lg, paddingVertical: 12, paddingHorizontal: 22 },
});
