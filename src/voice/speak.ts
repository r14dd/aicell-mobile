import { api } from '@/api/client';
import type { LayaLang } from '@/laya/client';
import { playWav, stopPlayback } from '@/voice/play';

/**
 * Every line the assistant says is synthesised by the server (`laya/speak/`, Gemini TTS) and played
 * back; the phone's own voices are never used. When the server cannot speak, the caption simply stays
 * up for a reading time so the flow keeps its pace.
 */
let generation = 0;

export async function speak(text: string, lang: LayaLang) {
  const mine = ++generation;
  try {
    const { audio, audio_mime } = await api<{ audio: string; audio_mime: string }>('laya/speak/', { method: 'POST', body: { text, language: lang }, timeoutMs: 20000 });
    if (generation !== mine) return;
    if (await playWav(audio, audio_mime)) return;
  } catch {
    // No voice from the server (no `laya/speak/` yet): the text stays on screen and the flow goes on at once,
    // so the microphone opens while the user is still reading.
  }
}

/** Cuts the current line short (the bubble tap, a new command). */
export function stopSpeaking() {
  generation += 1;
  stopPlayback();
}
