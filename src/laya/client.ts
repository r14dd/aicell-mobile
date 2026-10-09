import { api } from '@/api/client';
import type { Advisor, Insight } from '@/api/insights';

export type LayaTask =
  | 'topUp'
  | 'checkBalance'
  | 'checkRemaining'
  | 'openInternetPacks'
  | 'openRoaming'
  | 'openTariff'
  | 'openNotifications'
  | 'openSupport'
  | 'activatePack'
  | 'buyPack'
  | 'applyRedesign'
  | 'changeTariff'
  | 'explainInsight'
  | 'dismissInsight'
  | 'adviseTariff'
  | 'none';
export type LayaLang = 'az' | 'en';
export type LayaParams = Record<string, unknown>;
export type LayaPlan = { reply: string; task: LayaTask; params: LayaParams | null; amount: number | null; language: LayaLang };
/** The insight the user was just told, so a "yes", "no" or "why" has something to refer to. */
export type LayaPending = { insight_id: number | null; task: { name: string; params: Record<string, unknown> } };
export type LayaContext = {
  balance: number;
  dataGb: number;
  dataTotalGb: number;
  minutes: number;
  minutesTotal: number;
  tariff: string;
  screen: string;
  name?: string;
  insights?: Insight[];
  advisor?: Advisor;
  pending?: LayaPending | null;
  history?: { role: 'user' | 'assistant'; text: string }[];
};

/** The server decides: what the user said → the reply to say, the task to run and its params. */
export const requestPlan = (text: string, context: LayaContext) =>
  api<LayaPlan>('laya/plan/', { method: 'POST', body: { text, context }, timeoutMs: 25000 });

/** After the app ran a task: one spoken sentence about how it went (never fails once the task ran). */
export const requestDone = (task: LayaTask, ok: boolean, language: LayaLang, context: Record<string, unknown>, error = '') =>
  api<{ reply: string; language: LayaLang }>('laya/done/', { method: 'POST', body: { task, ok, error: error.slice(0, 200), language, context }, timeoutMs: 25000 });

/** The server words one of its insights as speech in the user's language. */
export const requestNarration = (insight: Insight, language: LayaLang, name: string) =>
  api<{ speech: string; language: LayaLang }>('laya/narrate/', { method: 'POST', body: { insight, language, name }, timeoutMs: 25000 });
