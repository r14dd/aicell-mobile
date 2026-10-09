import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import type { ExpoSpeechRecognitionErrorEvent, ExpoSpeechRecognitionResultEvent } from 'expo-speech-recognition';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AppState, Platform } from 'react-native';
import { useSharedValue, type SharedValue } from 'react-native-reanimated';

import { createConversation, sendVoice, type VoiceReply } from '@/api/assistant';
import { acceptInsight, ADVISOR_KEY, dismissInsight, getAdvisor, getInsights, INSIGHTS_KEY, markInsightSeen, type Insight } from '@/api/insights';
import { fetchQuery, useQuery } from '@/api/query';
import { requestNarration, requestPlan, type LayaPending } from '@/laya/client';
import { buildContext } from '@/laya/context';
import { abortPlan, runPlan } from '@/laya/executor';
import { getLayaUi, setLayaUi } from '@/laya/store';
import { guessLang, narr } from '@/laya/narration';
import { useAccount } from '@/state/account';
import { useSession } from '@/state/session';
import { recognizer } from '@/voice/engine';
import { speak, stopSpeaking } from '@/voice/speak';
import { playWav } from '@/voice/play';
import { dropWakePrefix, hasWakeWord } from '@/voice/wake';

export type AyselPhase = 'off' | 'denied' | 'wake' | 'listening' | 'thinking' | 'speaking' | 'done';
/** Where the voice UI is: the full overlay, the right-edge bubble, or nothing. */
export type VoiceMode = 'off' | 'full' | 'bubble';
export type ChatMessage = { id: number; role: 'user' | 'aysel'; text: string };

type AyselState = {
  /** A recognizer exists in this build. */
  available: boolean;
  phase: AyselPhase;
  /** Live transcript of the command being spoken. */
  heard: string;
  reply: string | null;
  /** Microphone level 0..1 for the orb animation. */
  level: SharedValue<number>;
  voice: VoiceMode;
  /** The assistant screen is mounted (the bubble waits for it to leave). */
  screenVisible: boolean;
  /** The screen was opened from the docked bot: it should glide in from the wall. */
  arriveFromDock: boolean;
  /** Bubble tap: stop whatever runs and bring the bot back to the screen. */
  summon: () => void;
  /** Bubble long press: the bot leaves the wall for good. */
  undock: () => void;
  /** A tapped insight card: the bot comes up, says the insight and waits for the answer. */
  discuss: (insight: Insight) => void;
  messages: ChatMessage[];
  /** Send the words heard so far without waiting for silence (the ✓ button). */
  confirm: () => void;
  /** Drop the current command and close the voice overlay (the X button). */
  cancel: () => void;
  /** Stop everything: listening, speech and the running plan (the bubble tap). */
  stop: () => void;
  /** The assistant screen mounted: take a command. */
  attach: () => void;
  /** The assistant screen unmounted: wait for the wake word again. */
  detach: () => void;
  /** Listen for a command now (mic button). */
  listen: () => void;
  /** Run a command without the microphone (suggestion chips). */
  ask: (text: string) => void;
  /** Like `ask`, but through the voice path: overlay, then the bubble. */
  say: (text: string) => void;
  requestAccess: () => void;
};

const noop = () => {};
const AyselContext = createContext<AyselState>({
  available: false,
  phase: 'off',
  heard: '',
  reply: null,
  level: { value: 0 } as SharedValue<number>,
  voice: 'off',
  screenVisible: false,
  arriveFromDock: false,
  summon: noop,
  undock: noop,
  discuss: noop,
  messages: [],
  confirm: noop,
  cancel: noop,
  stop: noop,
  attach: noop,
  detach: noop,
  listen: noop,
  ask: noop,
  say: noop,
  requestAccess: noop,
});

/** The Turkish on-device model knows the name Aysel; English is the stand-in until it is downloaded. */
const WAKE_LANG = 'tr-TR';
const WAKE_FALLBACK = 'en-US';
const COMMAND_LANG = 'az-AZ';
const IDLE_MS = 8000;
const SILENCE_MS = 1600;
const NATIVE = Platform.OS !== 'web';
/** The bot speaks Azerbaijani unless the user does otherwise. */
const SPEECH_LANG = 'az';
/** Tasks that carry out an insight's offer. */
const OFFER_TASKS = new Set<string>(['activatePack', 'buyPack', 'applyRedesign', 'changeTariff', 'topUp']);

type Mode = 'wake' | 'command';
type Session = 'none' | 'wake' | 'command';

/**
 * Owns the single speech session. On native an on-device session runs continuously while the app is
 * active and only looks for "Hey AIsel"; after the wake word it is swapped for one Azerbaijani network
 * session that captures the command. The command goes to the server's Laya brain for a plan, which the
 * executor carries out on the real screens. The server's insights arrive the same way: the bot docks at
 * the wall with "I have a tip", a tap lets it say the insight, and the answer is a yes, no or why.
 */
export function AyselProvider({ children }: { children: ReactNode }) {
  const engine = useMemo(() => recognizer(), []);
  const account = useAccount();
  const accountRef = useRef(account);
  useEffect(() => {
    accountRef.current = account;
  }, [account]);
  const { signedIn, account: me } = useSession();
  const signedInRef = useRef(signedIn);
  const nameRef = useRef(me.name);
  useEffect(() => {
    signedInRef.current = signedIn;
    nameRef.current = me.name;
  }, [signedIn, me.name]);

  const [phase, setPhase] = useState<AyselPhase>(engine ? (NATIVE ? 'wake' : 'done') : 'off');
  const [heard, setHeard] = useState('');
  const [reply, setReply] = useState<string | null>(null);
  const [voice, setVoice] = useState<VoiceMode>('off');
  const [screenVisible, setScreenVisible] = useState(false);
  const [arriveFromDock, setArriveFromDock] = useState(false);
  // Once a job has sent the bot to the wall it lives there until the user removes it.
  const docked = useRef(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);
  const level = useSharedValue(0);
  const voiceRef = useRef<VoiceMode>('off');
  const setVoiceMode = useCallback((next: VoiceMode) => {
    voiceRef.current = next;
    setVoice(next);
  }, []);

  const mode = useRef<Mode>('wake');
  const session = useRef<Session>('none');
  const running = useRef(false);
  const wantListening = useRef(false);
  const granted = useRef(false);
  const onDevice = useRef(false);
  const commandLang = useRef(COMMAND_LANG);
  const wakeLang = useRef(WAKE_FALLBACK);
  const screenOpen = useRef(false);
  const heardRef = useRef('');
  const consumed = useRef('');
  const idle = useRef<ReturnType<typeof setTimeout> | null>(null);
  const silence = useRef<ReturnType<typeof setTimeout> | null>(null);
  const restart = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Insights: the one the bot is docked for, the ones it already said, and the question a yes/no answers.
  const insightRef = useRef<Insight | null>(null);
  const told = useRef(new Set<number>());
  const narrateNext = useRef(false);
  const pendingRef = useRef<LayaPending | null>(null);
  // The command's recording (for the server's speech-to-text) and the server conversation it is filed under.
  const recordingUri = useRef<string | null>(null);
  const recordingWaiter = useRef<((uri: string | null) => void) | null>(null);
  /** The recording lands (`audioend`) a moment after the final transcript; a command waits briefly for it. */
  const waitRecording = useCallback(
    () =>
      new Promise<string | null>((resolve) => {
        if (recordingUri.current) return resolve(recordingUri.current);
        recordingWaiter.current = resolve;
        setTimeout(() => {
          if (recordingWaiter.current === resolve) recordingWaiter.current = null;
          resolve(recordingUri.current);
        }, 2500);
      }),
    [],
  );
  const conversationRef = useRef<number | null>(null);
  useEffect(() => {
    conversationRef.current = null;
  }, [me.number]);
  const insightsQuery = useQuery(signedIn ? INSIGHTS_KEY : null, getInsights);
  const latest = insightsQuery.data?.results[0];
  const latestRef = useRef(latest);
  useEffect(() => {
    latestRef.current = latest;
  }, [latest]);

  const clearTimers = useCallback(() => {
    for (const t of [idle, silence, restart]) {
      if (t.current) clearTimeout(t.current);
      t.current = null;
    }
  }, []);

  const refreshInsights = useCallback(() => fetchQuery(INSIGHTS_KEY, getInsights).then(noop, noop), []);

  /** Docks the bot at the wall with "I have a tip" when nothing else is going on. */
  const offerInsight = useCallback(
    (insight: Insight) => {
      if (insightRef.current?.id === insight.id || told.current.has(insight.id)) return;
      if (screenOpen.current || mode.current === 'command' || getLayaUi().busy || voiceRef.current === 'full') return;
      insightRef.current = insight;
      docked.current = true;
      setVoiceMode('bubble');
      setLayaUi({ caption: narr(SPEECH_LANG, 'haveTip') });
      if (insight.status === 'new') markInsightSeen(insight.id).catch(noop);
    },
    [setVoiceMode],
  );

  useEffect(() => {
    if (!latest) return;
    const timer = setTimeout(() => offerInsight(latest), 600);
    return () => clearTimeout(timer);
  }, [latest, offerInsight]);

  const startWake = useCallback(() => {
    if (!engine || !NATIVE || running.current || !wantListening.current) return;
    running.current = true;
    session.current = 'wake';
    consumed.current = '';
    engine.start({
      lang: wakeLang.current,
      interimResults: true,
      continuous: true,
      requiresOnDeviceRecognition: onDevice.current,
      contextualStrings: ['Aysel', 'Hey Aysel', 'AIsel', 'Azercell'],
      androidIntentOptions: {
        EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS: 30000,
        EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS: 30000,
      },
      iosTaskHint: 'dictation',
      volumeChangeEventOptions: { enabled: true, intervalMillis: 100 },
    });
  }, [engine]);

  const startCommand = useCallback(() => {
    if (!engine || running.current) return;
    running.current = true;
    session.current = 'command';
    engine.start({
      lang: commandLang.current,
      interimResults: true,
      continuous: false,
      requiresOnDeviceRecognition: false,
      contextualStrings: ['Azercell', 'manat', 'balans', 'rouminq', 'internet', 'tarif'],
      androidIntentOptions: {
        EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS: 1500,
        EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS: 1200,
      },
      iosTaskHint: 'search',
      volumeChangeEventOptions: { enabled: true, intervalMillis: 100 },
      recordingOptions: { persist: true },
    });
  }, [engine]);

  /** The recorded question goes to the server: its transcript, its answer and that answer as speech. */
  const askVoice = useCallback(async (uri: string): Promise<VoiceReply> => {
    if (!conversationRef.current) conversationRef.current = (await createConversation()).id;
    try {
      return await sendVoice(conversationRef.current, uri);
    } catch (e) {
      if (__DEV__) console.log('[aysel] voice upload failed', uri, e instanceof Error ? `${e.name}: ${e.message}` : String(e));
      throw e;
    }
  }, []);

  const scheduleRestart = useCallback(
    (ms: number) => {
      if (!NATIVE || !wantListening.current || restart.current) return;
      restart.current = setTimeout(() => {
        restart.current = null;
        startWake();
      }, ms);
    },
    [startWake],
  );

  const beginCommand = useCallback(() => {
    if (!engine) return;
    clearTimers();
    stopSpeaking();
    mode.current = 'command';
    heardRef.current = '';
    setHeard('');
    // The last thing said (an offer waiting for its answer) stays on screen while the microphone is open.
    setPhase('listening');
    setVoiceMode('full');
    idle.current = setTimeout(() => {
      if (mode.current !== 'command') return;
      mode.current = 'wake';
      setReply(narr(SPEECH_LANG, 'didNotHear'));
      setMessages((m) => [...m, { id: Date.now(), role: 'aysel', text: narr(SPEECH_LANG, 'didNotHear') }]);
      setPhase('done');
      // Silence keeps the bot on screen, waiting; only X or a job moves it.
      if (session.current === 'command') engine.abort();
    }, IDLE_MS);
    if (session.current === 'none') startCommand();
    else if (session.current === 'wake') engine.abort();
  }, [engine, clearTimers, startCommand, setVoiceMode]);

  const finish = useCallback(
    (heardOnDevice: string) => {
      clearTimers();
      mode.current = 'wake';
      heardRef.current = '';
      setHeard(heardOnDevice);
      setReply(null);
      setPhase('thinking');

      const deps = { balance: () => accountRef.current.balance };
      // The recording goes to the server first: Gemini transcribes it, answers it and speaks the answer.
      // The device transcript only stands in when there is no recording (web) or the server fails.
      let text = heardOnDevice;
      (NATIVE ? waitRecording() : Promise.resolve(null))
        .then((uri) => {
          recordingUri.current = null;
          if (__DEV__) console.log('[aysel] command recording', uri);
          return uri ? askVoice(uri).catch(() => null) : null;
        })
        .then(async (answer) => {
          if (answer?.transcript) {
            text = answer.transcript;
            setHeard(text);
          }
          setMessages((m) => [...m, { id: Date.now(), role: 'user', text }]);
          const context = buildContext({
            balance: accountRef.current.balance,
            name: nameRef.current,
            screen: screenOpen.current ? 'assistant' : 'app',
            pending: pendingRef.current,
            history: messagesRef.current,
          });
          const received = await requestPlan(text, context);
          if (__DEV__) console.log('[aysel] plan', JSON.stringify({ text, task: received.task, params: received.params, reply: received.reply.slice(0, 80) }));
          const pending = pendingRef.current;
          let plan = received;
          if (pending && received.task === pending.task.name) {
            // A "yes": the model may echo the task without its params; the question it answers carries them.
            plan = { ...received, params: { ...pending.task.params, ...(received.params ?? {}), insight_id: received.params?.insight_id ?? pending.insight_id } };
          } else if ((received.task === 'explainInsight' || received.task === 'dismissInsight') && !received.params?.insight_id && pending?.insight_id) {
            plan = { ...received, params: { ...(received.params ?? {}), insight_id: pending.insight_id } };
          }
          // A question (nothing to do in the app) is answered by the server's assistant in its own voice.
          const answered = !!answer && (plan.task === 'none' || plan.task === 'checkBalance');
          const spoken = (answered && answer.message.content) || plan.reply;
          setReply(spoken);
          setMessages((m) => [...m, { id: Date.now() + 1, role: 'aysel', text: spoken }]);
          setPhase('speaking');
          if (answered) {
            const played = !!answer.audio && (await playWav(answer.audio, answer.audio_mime));
            if (__DEV__) console.log('[aysel] answer audio', answer.audio ? `${answer.audio.length} b64 chars` : 'none', 'played', played);
            if (!played) await speak(spoken, plan.language);
            return;
          }

          if (plan.task === 'adviseTariff') {
            // The reply carries the analysis; the recommended setup becomes the question a "yes" answers.
            const advisor = await fetchQuery(ADVISOR_KEY, getAdvisor).catch(() => undefined);
            const pick = advisor?.candidates.find((c) => c.id === advisor.recommended);
            pendingRef.current = pick ? { insight_id: null, task: pick.task } : null;
            await speak(plan.reply, plan.language);
            if (pendingRef.current && screenOpen.current) beginCommand();
            return;
          }
          if (plan.task === 'dismissInsight') {
            const id = Number(plan.params?.insight_id ?? pending?.insight_id ?? 0);
            if (id) dismissInsight(id).catch(noop);
            pendingRef.current = null;
            insightRef.current = null;
            docked.current = true;
            setVoiceMode('bubble');
            await runPlan(plan, deps);
            void refreshInsights();
            return;
          }
          // A job sends the bot to the right wall (the screen animates it there and leaves); a plain answer is spoken in place.
          const job = plan.task !== 'none' && plan.task !== 'checkBalance';
          if (job) {
            docked.current = true;
            setVoiceMode('bubble');
          }
          // Carrying out an offer answers the insight; "why" only shows the figures and keeps the question open.
          if (OFFER_TASKS.has(plan.task)) {
            const insightId = Number(plan.params?.insight_id ?? (pending && pending.task.name === plan.task ? pending.insight_id : 0) ?? 0);
            if (insightId) acceptInsight(insightId).catch(noop);
            pendingRef.current = null;
            insightRef.current = null;
          }
          await runPlan(plan, deps);
          if (job) void refreshInsights();
        })
        .catch(async () => {
          const lang = guessLang(text);
          const message = narr(lang, 'serverDown');
          setReply(message);
          setMessages((m) => [...m, { id: Date.now() + 1, role: 'aysel', text: message }]);
          setPhase('speaking');
          await speak(message, lang);
        })
        .finally(() => {
          setPhase('done');
          // Once the job is over the next tip, if any, can wait at the wall again.
          setTimeout(() => {
            if (latestRef.current) offerInsight(latestRef.current);
          }, 3000);
        });
    },
    [clearTimers, setVoiceMode, beginCommand, refreshInsights, offerInsight, askVoice, waitRecording],
  );

  /** Says the docked insight (worded by the server) and then listens for the answer. */
  const narrate = useCallback(async () => {
    const insight = insightRef.current;
    narrateNext.current = false;
    if (!insight) return;
    told.current.add(insight.id);
    clearTimers();
    setHeard('');
    setReply(null);
    setPhase('thinking');
    try {
      const { speech, language } = await requestNarration(insight, SPEECH_LANG, nameRef.current);
      const offer = insight.offers[insight.recommended] ?? insight.offers[0];
      pendingRef.current = offer ? { insight_id: insight.id, task: offer.task } : null;
      setReply(speech);
      setMessages((m) => [...m, { id: Date.now(), role: 'aysel', text: speech }]);
      setPhase('speaking');
      await speak(speech, language);
      // The offer stays on screen to be read; a tap on the bot (or the wake word) takes the answer.
      setPhase('done');
    } catch {
      const message = narr(SPEECH_LANG, 'serverDown');
      setReply(message);
      setPhase('speaking');
      await speak(message, SPEECH_LANG);
      setPhase('done');
    }
  }, [clearTimers]);

  const boot = useCallback(async () => {
    if (!engine || !NATIVE) return;
    try {
      granted.current = (await engine.requestPermissionsAsync()).granted;
    } catch {
      granted.current = false;
    }
    if (!granted.current) {
      setPhase('denied');
      return;
    }
    try {
      const { installedLocales } = await engine.getSupportedLocales({});
      const installed = installedLocales.map((l: string) => l.toLowerCase());
      if (installed.some((l) => l.startsWith('tr'))) {
        wakeLang.current = WAKE_LANG;
        onDevice.current = true;
      } else {
        wakeLang.current = WAKE_FALLBACK;
        onDevice.current = installed.some((l) => l.startsWith('en'));
        if (Platform.OS === 'android') engine.androidTriggerOfflineModelDownload({ locale: WAKE_LANG }).catch(noop);
      }
      if (__DEV__) console.log(`[aysel] wake language ${wakeLang.current}, on-device ${onDevice.current}, installed: ${installed.join(', ')}`);
    } catch {
      onDevice.current = false;
    }
    wantListening.current = AppState.currentState === 'active';
    setPhase(screenOpen.current ? 'done' : 'wake');
    startWake();
  }, [engine, startWake]);

  useEffect(() => {
    if (!engine) return;
    const subs = [
      engine.addListener('result', (ev: ExpoSpeechRecognitionResultEvent) => {
        let text = ev.results[0]?.transcript?.trim() ?? '';
        if (session.current === 'wake') {
          if (consumed.current && text.startsWith(consumed.current)) text = text.slice(consumed.current.length).trim();
          if (ev.isFinal) consumed.current = ev.results[0]?.transcript?.trim() ?? '';
          if (!text || !signedInRef.current || mode.current !== 'wake' || !hasWakeWord(text)) return;
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(noop);
          beginCommand();
          if (!screenOpen.current) router.push('/aysel');
          return;
        }
        if (session.current === 'command' && mode.current === 'command' && text) {
          // The network recognizer streams partial text; the first words cancel the "nothing heard" timer
          // and a short silence after the last change counts as the end of the command.
          const spoken = dropWakePrefix(text);
          if (!spoken) return;
          if (idle.current) clearTimeout(idle.current);
          idle.current = null;
          if (silence.current) clearTimeout(silence.current);
          silence.current = null;
          heardRef.current = spoken;
          setHeard(spoken);
          if (ev.isFinal) {
            finish(spoken);
            return;
          }
          silence.current = setTimeout(() => {
            silence.current = null;
            if (mode.current !== 'command' || !heardRef.current) return;
            const command = heardRef.current;
            if (session.current === 'command') engine.abort();
            finish(command);
          }, SILENCE_MS);
        }
      }),
      engine.addListener('end', () => {
        running.current = false;
        level.value = 0;
        const was = session.current;
        session.current = 'none';
        if (was === 'command') {
          if (mode.current === 'command') {
            if (heardRef.current) finish(heardRef.current);
            else {
              mode.current = 'wake';
              setReply(narr(SPEECH_LANG, 'didNotHear'));
              setPhase('done');
            }
          }
          if (NATIVE) startWake();
          return;
        }
        if (mode.current === 'command') {
          startCommand();
          return;
        }
        scheduleRestart(250);
      }),
      engine.addListener('error', (ev: ExpoSpeechRecognitionErrorEvent) => {
        if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed') {
          wantListening.current = false;
          granted.current = false;
          setPhase('denied');
          return;
        }
        if (ev.error === 'language-not-supported') {
          if (session.current === 'command') commandLang.current = 'en-US';
          else if (wakeLang.current !== WAKE_FALLBACK) wakeLang.current = WAKE_FALLBACK;
          else onDevice.current = false;
        }
      }),
      engine.addListener('audioend', (ev: { uri: string | null }) => {
        if (!ev.uri) return;
        recordingUri.current = ev.uri;
        recordingWaiter.current?.(ev.uri);
        recordingWaiter.current = null;
      }),
      engine.addListener('volumechange', (ev: { value: number }) => {
        level.value = Math.min(1, Math.max(0, (ev.value + 2) / 12));
      }),
    ];
    const app = AppState.addEventListener('change', (state) => {
      if (state === 'active' && signedInRef.current) void refreshInsights();
      if (!NATIVE || !granted.current) return;
      if (state === 'active') {
        wantListening.current = true;
        startWake();
        return;
      }
      wantListening.current = false;
      clearTimers();
      stopSpeaking();
      engine.abort();
      running.current = false;
      session.current = 'none';
      if (mode.current === 'command') {
        mode.current = 'wake';
        setPhase(screenOpen.current ? 'done' : 'wake');
      }
    });
    boot().catch(noop);
    return () => {
      subs.forEach((s) => s.remove());
      app.remove();
      clearTimers();
      engine.abort();
    };
  }, [engine, beginCommand, finish, scheduleRestart, startWake, startCommand, clearTimers, boot, level, setVoiceMode, refreshInsights]);

  const attach = useCallback(() => {
    screenOpen.current = true;
    setScreenVisible(true);
    setArriveFromDock(false);
    if (narrateNext.current) {
      void narrate();
      return;
    }
    if (!engine || (NATIVE && !granted.current)) return;
    if (mode.current !== 'command') beginCommand();
  }, [engine, beginCommand, narrate]);

  const detach = useCallback(() => {
    screenOpen.current = false;
    setScreenVisible(false);
    clearTimers();
    if (mode.current === 'command') {
      mode.current = 'wake';
      if (session.current === 'command' && engine) engine.abort();
    }
    heardRef.current = '';
    setHeard('');
    setReply(null);
    if (voiceRef.current === 'full') setVoiceMode(docked.current ? 'bubble' : 'off');
    setPhase(engine ? (NATIVE && granted.current ? 'wake' : NATIVE ? 'denied' : 'done') : 'off');
  }, [engine, clearTimers, setVoiceMode]);

  const listen = useCallback(() => {
    if (!engine) return;
    if (NATIVE && !granted.current) {
      boot().catch(noop);
      return;
    }
    beginCommand();
  }, [engine, beginCommand, boot]);

  const ask = useCallback(
    (text: string) => {
      if (mode.current === 'command') {
        mode.current = 'wake';
        if (session.current === 'command' && engine) engine.abort();
      }
      finish(text);
    },
    [engine, finish],
  );

  // Web dev builds expose the typed-command path so browser tests can answer without a microphone.
  useEffect(() => {
    if (__DEV__ && !NATIVE) (globalThis as { __ayselAsk?: (text: string) => void }).__ayselAsk = ask;
  }, [ask]);

  const say = useCallback(
    (text: string) => {
      if (mode.current === 'command') {
        mode.current = 'wake';
        if (session.current === 'command' && engine) engine.abort();
      }
      setVoiceMode('full');
      setTimeout(() => finish(text), 900);
    },
    [engine, finish, setVoiceMode],
  );

  const confirm = useCallback(() => {
    if (mode.current !== 'command' || !heardRef.current) return;
    const text = heardRef.current;
    if (session.current === 'command' && engine) engine.abort();
    finish(text);
  }, [engine, finish]);

  const cancel = useCallback(() => {
    clearTimers();
    if (mode.current === 'command') {
      mode.current = 'wake';
      if (session.current === 'command' && engine) engine.abort();
    }
    heardRef.current = '';
    setHeard('');
    setPhase('done');
    setVoiceMode(docked.current ? 'bubble' : 'off');
  }, [engine, clearTimers, setVoiceMode]);

  const stop = useCallback(() => {
    cancel();
    stopSpeaking();
    abortPlan();
    setLayaUi({ busy: false, caption: null, cursor: null, pressing: false });
  }, [cancel]);

  const summon = useCallback(() => {
    stopSpeaking();
    abortPlan();
    setLayaUi({ busy: false, caption: null, cursor: null, pressing: false });
    // A docked tip is said first; after that the bot simply listens.
    if (insightRef.current && !told.current.has(insightRef.current.id)) narrateNext.current = true;
    setArriveFromDock(true);
    setVoiceMode('full');
    if (!screenOpen.current) router.push('/aysel');
  }, [setVoiceMode]);

  const discuss = useCallback(
    (insight: Insight) => {
      stopSpeaking();
      abortPlan();
      setLayaUi({ busy: false, caption: null, cursor: null, pressing: false });
      insightRef.current = insight;
      told.current.delete(insight.id);
      narrateNext.current = true;
      pendingRef.current = null;
      if (insight.status === 'new') markInsightSeen(insight.id).catch(noop);
      setArriveFromDock(false);
      setVoiceMode('full');
      if (screenOpen.current) void narrate();
      else router.push('/aysel');
    },
    [narrate, setVoiceMode],
  );

  const undock = useCallback(() => {
    docked.current = false;
    insightRef.current = null;
    pendingRef.current = null;
    stop();
    setVoiceMode('off');
  }, [stop, setVoiceMode]);

  const requestAccess = useCallback(() => {
    boot().catch(noop);
  }, [boot]);

  const value = useMemo(
    () => ({ available: !!engine, phase, heard, reply, level, voice, screenVisible, arriveFromDock, summon, undock, discuss, messages, confirm, cancel, stop, attach, detach, listen, ask, say, requestAccess }),
    [engine, phase, heard, reply, level, voice, screenVisible, arriveFromDock, summon, undock, discuss, messages, confirm, cancel, stop, attach, detach, listen, ask, say, requestAccess],
  );
  return <AyselContext.Provider value={value}>{children}</AyselContext.Provider>;
}

export const useAysel = () => useContext(AyselContext);
