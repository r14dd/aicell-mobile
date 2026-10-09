# aicell-mobile

<p align="center">
  <img src="https://img.shields.io/badge/expo-57-000020.svg?logo=expo" alt="Expo 57">
  <img src="https://img.shields.io/badge/react--native-0.86-61DAFB.svg?logo=react" alt="React Native 0.86">
  <img src="https://img.shields.io/badge/typescript-6.0-3178C6.svg?logo=typescript&logoColor=white" alt="TypeScript 6.0">
  <img src="https://img.shields.io/badge/languages-az%20%7C%20en-informational.svg" alt="az, en">
  <img src="https://img.shields.io/badge/platforms-ios%20%7C%20android%20%7C%20web-lightgrey.svg" alt="iOS, Android, web">
</p>

`aicell-mobile` is the mobile client of a mobile operator's self-service app.
It connects to [aicell-api](https://github.com/r14dd/aicell-api) for balance,
tariffs, packs, usage insights and an AI assistant called Laya that speaks in
Azerbaijani or English and acts on the subscriber's line in one tap.

## What the subscriber sees

- **Home** — balance, remaining data and minutes, tariff, renewal date, banner
  carousel, stories (gift wheel, promotions, partner perks), quick actions.
- **Products** — internet packs (by app, social, general), tariffs with
  IsteSen slider, roaming packs.
- **Payments** — top-up by card, Google Pay, Akart, voucher; Kredit products
  (EkstraKredit, InternetKredit, SimKredit, SimTaksit, Tamamla).
- **Benefits** — premium programme, invite and earn, lottery, Steam top-up.
- **More** — SIM settings, line status, call forwarding, PUK, eSIM transfer
  and recovery, notifications, support.
- **Laya** — voice assistant on every screen: wake word, speech-to-text,
  spoken replies, task execution (top up, buy pack, change tariff, explain
  insight), with a docked bubble that follows across tabs.

## How Laya works on the client

```
subscriber speaks ─► on-device STT ─► POST /laya/plan/ { text, context }
                                                │
                                        server returns { reply, task, params }
                                                │
                  app runs the task ◄────────────┘
                         │
                  POST /laya/done/ { task, ok }
                         │
                  server returns { reply } ─► on-device TTS ─► subscriber hears
```

The phone does speech-to-text and text-to-speech locally (`expo-speech-recognition`,
`expo-speech`). The server decides intent and wording; the client only executes.
Navigation, purchases and pack activations go through the same code paths as
manual taps. After each task the client reports success or failure and gets one
spoken sentence back.

The voice state machine (`src/state/aysel.tsx`) handles wake → listening →
thinking → speaking → done, with abort on bubble tap and a docked mode that
persists across screens.

## Project map

| Path | What |
|---|---|
| `src/app/` | Routes (Expo Router file-based) |
| `src/components/` | Shared UI: cards, sheets, carousels, pickers |
| `src/components/ui/` | Primitives: Button, Card, TextField, Toggle, Pill |
| `src/components/aysel/` | Assistant UI: orb animation, speech bubble, pill |
| `src/api/` | API client, per-domain adapters, query cache |
| `src/data/` | Mock/seed data for offline rendering |
| `src/state/` | React contexts: account, session, assistant, stories |
| `src/laya/` | Laya client, context builder, task executor, narration |
| `src/voice/` | STT engine, TTS, wake word detection |
| `src/theme/` | Design tokens and input styles |
| `assets/images/` | App icons and reference rasters |
| `docs/backend/` | Backend API and architecture docs |

## Run

```sh
npm install
npx expo start
```

Scan the QR code with Expo Go, or press `w` for web. The app renders its
built-in seed data until a backend answers.

```sh
EXPO_PUBLIC_API_URL=http://192.168.1.x:8010/api/   # LAN IP for a phone
EXPO_PUBLIC_API_TOKEN=<token>                       # omit with DEMO_AUTH=true
```

## Stack

| | |
|---|---|
| Framework | Expo SDK 57 with Expo Router (file-based routing) |
| Language | TypeScript 6.0, strict |
| UI | React Native 0.86, Reanimated 4, Gesture Handler |
| Font | Geist (via `@expo-google-fonts/geist`) |
| Voice | `expo-speech-recognition` (STT), `expo-speech` (TTS) |
| Auth | `expo-local-authentication` (Face ID / fingerprint for payments) |
| Lint | ESLint 9 with `eslint-config-expo` |
| Type check | `npm run typecheck` |

## Not real yet

Usage comes from seed data (there is no network feed), top-ups do not reach a
payment provider, and sign-in takes a fixed test code until an SMS gateway is
wired in. Reference images under `assets/images/ref/` are cropped from
screenshots; replace with brand originals before any public use.
