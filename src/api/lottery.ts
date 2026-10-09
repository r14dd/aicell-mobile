import { api } from '@/api/client';
import { lotteryIcons, type LotteryBlock, type LotterySection } from '@/data/lottery';

type ApiBlock = { kind: 'p'; text: string; num?: string; bold?: string } | { kind: 'example'; items: { label: string; value: string }[] };
type ApiRules = { sections: { title: string; icon: string | null; blocks: ApiBlock[] }[]; terms_url: string | null };

const toBlock = (b: ApiBlock): LotteryBlock =>
  b.kind === 'example' ? { kind: 'example', items: b.items.map((it) => `${it.label} = ${it.value}`) } : { kind: 'p', text: b.text, bold: b.bold, num: b.num };

/** Icons the screen cannot draw are dropped rather than guessed. */
const toSections = (rules: ApiRules): LotterySection[] =>
  rules.sections.map((s) => ({ title: s.title, icon: lotteryIcons.find((i) => i === s.icon), blocks: s.blocks.map(toBlock) }));

export const getLotterySections = () => api<ApiRules>('content/lottery/rules/').then(toSections);
