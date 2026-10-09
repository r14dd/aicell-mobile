import { router, type Href } from 'expo-router';
import { Keyboard } from 'react-native';

import { INSIGHTS_KEY, type Insight, type InsightKind } from '@/api/insights';
import { getQueryData } from '@/api/query';
import type { RoamingPacks } from '@/api/sim';
import { tariffPath, type MyUsage } from '@/api/tariffs';
import type { InternetPacksData } from '@/data/internetPacks';
import { money } from '@/data/mock';
import type { ChangeGroup, Redesign } from '@/data/myTariff';
import type { TariffPage } from '@/data/tariffs';
import { requestDone, type LayaLang, type LayaPlan, type LayaTask } from '@/laya/client';
import { narr, type NarrationKey } from '@/laya/narration';
import { getLayaUi, setLayaUi, waitForSignal } from '@/laya/store';
import { waitForTarget } from '@/laya/targets';
import { speak } from '@/voice/speak';

type Deps = { balance: () => number };

/** The account after a task, for the outcome sentence. */
const afterTask = (deps: Deps) => {
  const usage = getQueryData<MyUsage>('tariffs/my/usage/');
  return { balance: deps.balance(), dataGb: usage ? Number(usage.remaining.data_gb) : undefined, tariff: usage?.tariff };
};

let aborted = false;
/** Stops the running plan at its next step (the bubble tap). */
export function abortPlan() {
  aborted = true;
}
const check = () => {
  if (aborted) throw new Error('aborted');
};
const wait = (ms: number) =>
  new Promise<void>((resolve, reject) => setTimeout(() => (aborted ? reject(new Error('aborted')) : resolve()), ms));

const PAGES: Partial<Record<LayaTask, Href>> = {
  checkRemaining: '/remaining-balance',
  openInternetPacks: '/internet-packs',
  openRoaming: '/sim/roaming',
  openTariff: '/my-tariff',
  openNotifications: '/notifications',
  openSupport: '/support',
};

/** Where the figures behind an insight are shown. */
const EVIDENCE: Record<InsightKind, Href> = {
  overage: '/remaining-balance',
  forecast_gap: '/remaining-balance',
  underused: '/remaining-balance',
  renewal_shortfall: '/top-ups',
  video_heavy: '/internet-packs',
  repeat_packs: '/internet-packs',
  social_heavy: '/internet-packs',
  roaming: '/sim/roaming',
};

/** Outcomes a screen reports after a purchase Laya started. */
const OUTCOMES = ['paid', 'authFailed', 'failed'];
const SLIDERS = ['internet', 'calls', 'instagramFb', 'youtube', 'tiktok'] as const;

async function point(id: string) {
  check();
  const target = await waitForTarget(id);
  if (!target) throw new Error(`Laya target missing: ${id}`);
  const rect = await target.measure();
  if (rect) {
    setLayaUi({ cursor: { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 } });
    await wait(560);
  }
  return target;
}

async function press(id: string) {
  const target = await point(id);
  setLayaUi({ pressing: true });
  await wait(140);
  setLayaUi({ pressing: false });
  return target;
}

async function tap(id: string) {
  const target = await press(id);
  target.handlers().press?.();
  await wait(700);
}

/** Sets a control (a slider) to a value in one move. */
async function set(id: string, value: string) {
  const target = await press(id);
  const setter = target.handlers().setValue;
  if (!setter) throw new Error(`Laya cannot set ${id}`);
  setter(value);
  await wait(550);
}

async function type(id: string, value: string) {
  const target = await point(id);
  const setter = target.handlers().setValue;
  if (!setter) throw new Error(`Laya cannot type into ${id}`);
  for (let i = 1; i <= value.length; i += 1) {
    setter(value.slice(0, i));
    await wait(170);
  }
  Keyboard.dismiss();
  await wait(450);
}

function tell(lang: LayaLang, key: NarrationKey, vars?: Record<string, string>) {
  const text = narr(lang, key, vars);
  setLayaUi({ caption: text });
  return speak(text, lang);
}

/** Says how a task went: the server words it from the outcome and the account after it; the fixed line is the fallback. */
async function sayDone(task: LayaTask, ok: boolean, lang: LayaLang, deps: Deps, fallback: NarrationKey, vars?: Record<string, string>, error = '') {
  try {
    const { reply } = await requestDone(task, ok, lang, afterTask(deps), error);
    setLayaUi({ caption: reply });
    await speak(reply, lang);
  } catch {
    await tell(lang, fallback, vars);
  }
}

/** Says the screen's verdict on a purchase; `verdict` is armed before the press so a fast answer is not missed. */
async function outcome(task: LayaTask, lang: LayaLang, deps: Deps, doneKey: NarrationKey, vars: Record<string, string>, verdict: Promise<string | null>) {
  const result = await verdict;
  setLayaUi({ cursor: null });
  await wait(250);
  if (result === 'paid') await sayDone(task, true, lang, deps, doneKey, vars);
  else if (result === 'authFailed') await sayDone(task, false, lang, deps, 'authFailed', undefined, narr(lang, 'authFailed'));
  else if (result === 'failed') await sayDone(task, false, lang, deps, 'failed', { message: getLayaUi().error ?? '' }, getLayaUi().error ?? '');
  else await tell(lang, 'timeout');
}

/** The voice screen glides its bot to the wall and leaves on its own (~500 ms); pushing before that would land under it. */
async function leaveAssistant() {
  await wait(700);
}

/** `5gb` → `5 GB`. */
const planLabel = (id: string) => id.replace(/^(\d+)(gb|mb)$/i, (_m, n: string, u: string) => `${n} ${u.toUpperCase()}`);
const str = (params: Record<string, unknown> | null, key: string) => (params?.[key] === undefined || params?.[key] === null ? '' : String(params[key]));

const insightKind = (id: number): InsightKind =>
  getQueryData<{ results: Insight[] }>(INSIGHTS_KEY)?.results.find((i) => i.id === id)?.kind ?? 'forecast_gap';

/** Carries out one plan on the real screens, narrating each step. */
export async function runPlan(plan: LayaPlan, deps: Deps) {
  const lang = plan.language;
  const params = plan.params;
  aborted = false;
  setLayaUi({ busy: true, caption: plan.reply, cursor: null, pressing: false, error: null });
  try {
    switch (plan.task) {
      case 'topUp': {
        const amount = plan.amount ?? Number(str(params, 'amount'));
        if (amount > 0) {
          await topUp(plan, String(amount), lang, deps);
          return;
        }
        break;
      }
      case 'activatePack':
        await activatePack(plan, str(params, 'slug'), str(params, 'plan'), lang, deps);
        return;
      case 'buyPack':
        await buyPack(plan, str(params, 'kind'), str(params, 'pack_id'), lang, deps);
        return;
      case 'applyRedesign':
        await applyRedesign(plan, params ?? {}, lang, deps);
        return;
      case 'changeTariff':
        await changeTariff(plan, str(params, 'plan'), lang, deps);
        return;
      case 'explainInsight': {
        void speak(plan.reply, lang);
        await leaveAssistant();
        router.push(EVIDENCE[insightKind(Number(str(params, 'insight_id')))]);
        await wait(600);
        return;
      }
      default:
        break;
    }
    const page = PAGES[plan.task];
    if (page) {
      void speak(plan.reply, lang);
      await leaveAssistant();
      router.push(page);
      await wait(600);
      return;
    }
    await speak(plan.reply, lang);
  } catch (e) {
    if (e instanceof Error && e.message === 'aborted') return;
    setLayaUi({ cursor: null });
    await tell(lang, 'failed', { message: '' });
  } finally {
    setLayaUi({ busy: false, cursor: null, pressing: false });
    setTimeout(() => setLayaUi({ caption: null }), aborted ? 0 : 2500);
  }
}

async function topUp(plan: LayaPlan, amount: string, lang: LayaLang, deps: Deps) {
  void speak(plan.reply, lang);
  await leaveAssistant();
  router.navigate('/');
  await wait(300);
  void tell(lang, 'openingTopUp');
  await tap('home.topUp');
  void tell(lang, 'choosingGooglePay');
  await tap('topup.googlePay');
  void tell(lang, 'typingAmount', { amount });
  await type('gpay.amount', amount);
  void tell(lang, 'continuing');
  await tap('gpay.continue');
  await wait(500);
  await tell(lang, 'scanFinger');
  const verdict = waitForSignal(['paid', 'authFailed'], 45000);
  await tap('gpay.pay');
  const result = await verdict;
  setLayaUi({ cursor: null });
  await wait(250);
  if (result === 'paid') await sayDone('topUp', true, lang, deps, 'topUpDone', { balance: money(deps.balance()) });
  else if (result === 'authFailed') await sayDone('topUp', false, lang, deps, 'authFailed', undefined, narr(lang, 'authFailed'));
  else await tell(lang, 'timeout');
}

async function activatePack(plan: LayaPlan, slug: string, planId: string, lang: LayaLang, deps: Deps) {
  void speak(plan.reply, lang);
  await leaveAssistant();
  router.navigate('/internet-packs');
  await wait(300);
  void tell(lang, 'openingSocial');
  await tap('packs.tab.social');
  const title = getQueryData<InternetPacksData>('packs/internet/')?.social.find((s) => s.id === slug)?.title ?? slug;
  void tell(lang, 'choosingPack', { label: title });
  await tap(`packs.card.${slug}`);
  await wait(400);
  void tell(lang, 'choosingPlan', { plan: planLabel(planId) });
  await tap(`social.plan.${planId}`);
  await tell(lang, 'scanFinger');
  const verdict = waitForSignal(OUTCOMES, 45000);
  await tap('social.cta');
  await outcome('activatePack', lang, deps, 'packDone', { label: `${title} ${planLabel(planId)}` }, verdict);
}

async function buyPack(plan: LayaPlan, kind: string, packId: string, lang: LayaLang, deps: Deps) {
  void speak(plan.reply, lang);
  await leaveAssistant();
  if (kind === 'roaming') {
    router.navigate('/sim/roaming');
    await wait(300);
    const name = getQueryData<RoamingPacks>('packs/roaming/')?.results.find((p) => p.id === packId)?.name ?? packId;
    void tell(lang, 'choosingPack', { label: name });
    await tap(`roaming.pack.${packId}`);
    await wait(400);
    await tell(lang, 'scanFinger');
    const verdict = waitForSignal(OUTCOMES, 45000);
    await tap('roaming.confirm');
    await outcome('buyPack', lang, deps, 'packDone', { label: name }, verdict);
    return;
  }
  router.navigate('/internet-packs');
  await wait(300);
  const data = getQueryData<InternetPacksData>('packs/internet/');
  const category = Object.entries(data?.packsByCategory ?? {}).find(([, list]) => list.some((p) => p.id === packId))?.[0] ?? 'high-volume';
  const label = data?.packsByCategory[category]?.find((p) => p.id === packId)?.label ?? packId;
  void tell(lang, 'openingPacks');
  await tap(`packs.tab.${category}`);
  void tell(lang, 'choosingPack', { label });
  await tap(`packs.buy.${packId}`);
  await wait(400);
  await tell(lang, 'scanFinger');
  const verdict = waitForSignal(OUTCOMES, 45000);
  await tap('packs.confirm');
  await outcome('buyPack', lang, deps, 'packDone', { label }, verdict);
}

async function applyRedesign(plan: LayaPlan, values: Record<string, unknown>, lang: LayaLang, deps: Deps) {
  void speak(plan.reply, lang);
  await leaveAssistant();
  router.push('/my-tariff/redesign');
  await wait(500);
  void tell(lang, 'openingRedesign');
  await wait(600);
  const config = getQueryData<Redesign>(tariffPath.redesign);
  for (const key of SLIDERS) {
    const value = Number(values[key]);
    if (!Number.isFinite(value)) continue;
    const slider = config?.sliders.find((s) => s.key === key);
    if (slider && slider.initial === value) continue;
    void tell(lang, 'settingSlider', { label: slider?.label ?? key, value: String(value) });
    await set(`redesign.${key}`, String(value));
  }
  void tell(lang, 'saving');
  const verdict = waitForSignal(['redesignSaved', 'failed'], 20000);
  await tap('redesign.save');
  const result = await verdict;
  setLayaUi({ cursor: null });
  await wait(250);
  if (result === 'redesignSaved') await sayDone('applyRedesign', true, lang, deps, 'redesignDone');
  else if (result === 'failed') await sayDone('applyRedesign', false, lang, deps, 'failed', { message: getLayaUi().error ?? '' }, getLayaUi().error ?? '');
  else await tell(lang, 'timeout');
}

async function changeTariff(plan: LayaPlan, planId: string, lang: LayaLang, deps: Deps) {
  void speak(plan.reply, lang);
  await leaveAssistant();
  const family = planId.startsWith('premium') ? 'premium-plus' : planId.split('-')[0];
  router.push('/my-tariff/change');
  await wait(400);
  void tell(lang, 'openingChange');
  await wait(500);
  const groups = getQueryData<ChangeGroup[]>(tariffPath.change);
  const group = groups?.find((g) => g.tariffs.some((t) => t.familyId === family));
  if (group && group.key !== 'digimax') await tap(`change.group.${group.key}`);
  const card = group?.tariffs.find((t) => t.familyId === family);
  void tell(lang, 'choosingTariff', { title: card?.name ?? family });
  await tap(`change.card.${card?.id ?? family}`);
  await wait(500);
  void tell(lang, 'choosingPlan', { plan: planLabel(planId) });
  await tap(`tariff.plan.${planId}`);
  const title = getQueryData<TariffPage>(tariffPath.family(family))?.family.plans.find((p) => p.id === planId)?.title ?? planId;
  await tell(lang, 'scanFinger');
  const verdict = waitForSignal(OUTCOMES, 45000);
  await tap('tariff.cta');
  await outcome('changeTariff', lang, deps, 'tariffDone', { title }, verdict);
}
