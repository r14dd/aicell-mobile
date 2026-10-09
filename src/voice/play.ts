import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';

/** Base64 → bytes (Hermes and browsers both have `atob`). */
function bytesOf(base64: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

let current: { remove: () => void; pause: () => void } | null = null;

/** Stops whatever is playing. */
export function stopPlayback() {
  try {
    current?.pause();
    current?.remove();
  } catch {
    // already gone
  }
  current = null;
}

/** Plays a WAV the server sent as base64 and resolves when it ends; false when it could not be played. */
export async function playWav(base64: string, mime = 'audio/wav'): Promise<boolean> {
  try {
    let uri: string;
    if (Platform.OS === 'web') {
      uri = `data:${mime};base64,${base64}`;
    } else {
      const file = new File(Paths.cache, 'aysel-answer.wav');
      file.write(bytesOf(base64));
      uri = file.uri;
    }
    await setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
    stopPlayback();
    const player = createAudioPlayer({ uri });
    current = player;
    const done = new Promise<void>((resolve) => {
      const sub = player.addListener('playbackStatusUpdate', (status) => {
        if (status.didJustFinish) {
          sub.remove();
          resolve();
        }
      });
      // A player that never reports the end must not hang the conversation.
      setTimeout(resolve, 60000);
    });
    player.play();
    await done;
    if (current === player) current = null;
    player.remove();
    return true;
  } catch (e) {
    if (__DEV__) console.log('[aysel] playWav failed', e instanceof Error ? `${e.name}: ${e.message}` : String(e));
    return false;
  }
}
