import type { LayaLang } from '@/laya/client';

export type NarrationKey =
  | 'openingTopUp'
  | 'choosingGooglePay'
  | 'typingAmount'
  | 'continuing'
  | 'scanFinger'
  | 'topUpDone'
  | 'authFailed'
  | 'timeout'
  | 'serverDown'
  | 'didNotHear'
  | 'haveTip'
  | 'openingPacks'
  | 'openingSocial'
  | 'choosingPack'
  | 'choosingPlan'
  | 'packDone'
  | 'openingRedesign'
  | 'settingSlider'
  | 'saving'
  | 'redesignDone'
  | 'openingChange'
  | 'choosingTariff'
  | 'tariffDone'
  | 'failed';

const STRINGS: Record<LayaLang, Record<NarrationKey, string>> = {
  az: {
    openingTopUp: 'Top up səhifəsini açıram.',
    choosingGooglePay: 'Google Pay seçirəm.',
    typingAmount: '{amount} manat yazıram.',
    continuing: 'Ödənişə keçirəm.',
    scanFinger: 'Zəhmət olmasa barmağınızı oxudun.',
    topUpDone: 'Hazırdır. Balansınız {balance} manatdır.',
    authFailed: 'Təsdiq alınmadı, ödənişi dayandırdım.',
    timeout: 'Təsdiq gəlmədi, ödənişi dayandırdım.',
    serverDown: 'Laya serverinə çata bilmirəm.',
    didNotHear: 'Sizi eşitmədim, bir daha deyin.',
    haveTip: 'Sizə bir məsləhətim var.',
    openingPacks: 'İnternet paketlərini açıram.',
    openingSocial: 'Sosial paketlərə keçirəm.',
    choosingPack: '{label} seçirəm.',
    choosingPlan: '{plan} planını seçirəm.',
    packDone: 'Hazırdır. {label} aktivdir.',
    openingRedesign: 'Tarif konstruktorunu açıram.',
    settingSlider: '{label}: {value} edirəm.',
    saving: 'Yadda saxlayıram.',
    redesignDone: 'Hazırdır. IsteSen+ növbəti yenilənmədən qüvvədədir.',
    openingChange: 'Tarif dəyişmə səhifəsini açıram.',
    choosingTariff: '{title} seçirəm.',
    tariffDone: 'Hazırdır. Tarifiniz indi {title}.',
    failed: 'Alınmadı. {message}',
  },
  en: {
    openingTopUp: 'Opening top up.',
    choosingGooglePay: 'Choosing Google Pay.',
    typingAmount: 'Typing {amount} manat.',
    continuing: 'Going to the payment.',
    scanFinger: 'Please scan your finger.',
    topUpDone: 'Done. Your balance is {balance} manat.',
    authFailed: 'Verification failed, I stopped the payment.',
    timeout: 'No confirmation came, I stopped the payment.',
    serverDown: 'I cannot reach the Laya server.',
    didNotHear: "I didn't hear you, please say it again.",
    haveTip: 'I have a tip for you.',
    openingPacks: 'Opening internet packs.',
    openingSocial: 'Going to the social packs.',
    choosingPack: 'Choosing {label}.',
    choosingPlan: 'Choosing the {plan} plan.',
    packDone: 'Done. {label} is active.',
    openingRedesign: 'Opening the tariff constructor.',
    settingSlider: 'Setting {label} to {value}.',
    saving: 'Saving.',
    redesignDone: 'Done. IsteSen+ applies from the next renewal.',
    openingChange: 'Opening change tariff.',
    choosingTariff: 'Choosing {title}.',
    tariffDone: 'Done. Your tariff is now {title}.',
    failed: 'That did not work. {message}',
  },
};

export function narr(lang: LayaLang, key: NarrationKey, vars?: Record<string, string>) {
  let text = STRINGS[lang][key];
  for (const [k, v] of Object.entries(vars ?? {})) text = text.replace(`{${k}}`, v);
  return text.trim();
}

/** Language of a transcript, from its letters; Azerbaijani when nothing says otherwise. */
export function guessLang(text: string): LayaLang {
  if (/[əığşçöüƏİĞŞÇÖÜ]/.test(text)) return 'az';
  if (/[a-z]/i.test(text)) return 'en';
  return 'az';
}

/** Chips on the assistant screen; each goes through the backend like spoken text. */
export const suggestions = ['Balansımı 5 manat artır', 'Balansım nə qədərdir?', 'Nə qədər internetim qalıb?', 'Rouminqi aç'];
