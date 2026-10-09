import { num } from '@/api/client';
import { ADVISOR_KEY, INSIGHTS_KEY, type Advisor, type Insight } from '@/api/insights';
import { getQueryData } from '@/api/query';
import type { MyUsage } from '@/api/tariffs';
import { subscriber } from '@/data/mock';
import type { LayaContext, LayaPending } from '@/laya/client';

type Turn = { role: 'user' | 'aysel'; text: string };
type Input = { balance: number; name: string; screen: 'assistant' | 'app'; pending: LayaPending | null; history: Turn[] };

/** Everything the server's brain gets with a command, read from the query cache (never waits for the network). */
export function buildContext(input: Input): LayaContext {
  const usage = getQueryData<MyUsage>('tariffs/my/usage/');
  const r = usage?.remaining;
  return {
    balance: input.balance,
    dataGb: r ? num(r.data_gb) : subscriber.remaining.dataGb,
    dataTotalGb: r ? num(r.data_total_gb) : subscriber.remaining.dataTotalGb,
    minutes: r?.minutes ?? subscriber.remaining.minutes,
    minutesTotal: r?.minutes_total ?? subscriber.remaining.minutesTotal,
    tariff: usage?.tariff ?? subscriber.tariff.name,
    screen: input.screen,
    name: input.name,
    insights: getQueryData<{ results: Insight[] }>(INSIGHTS_KEY)?.results ?? [],
    advisor: getQueryData<Advisor>(ADVISOR_KEY),
    pending: input.pending,
    history: input.history.slice(-6).map((t) => ({ role: t.role === 'aysel' ? 'assistant' : 'user', text: t.text })),
  };
}
