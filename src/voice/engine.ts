type Engine = typeof import('expo-speech-recognition').ExpoSpeechRecognitionModule;

let cached: Engine | null | undefined;

/**
 * The speech recognizer, or null where it cannot run: Expo Go has no native module and some
 * browsers lack the Web Speech API. Required lazily so those environments still boot without voice.
 */
export function recognizer(): Engine | null {
  if (cached !== undefined) return cached;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('expo-speech-recognition') as typeof import('expo-speech-recognition');
    cached = mod.ExpoSpeechRecognitionModule.isRecognitionAvailable() ? mod.ExpoSpeechRecognitionModule : null;
  } catch {
    cached = null;
  }
  return cached;
}
