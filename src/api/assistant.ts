import { FileSystemUploadType, uploadAsync } from 'expo-file-system/legacy';

import { api, API_URL, ApiError, apiHeaders } from '@/api/client';

type ApiInbox = {
  greeting: string;
  unread: number;
  actions: { key: string; title: string; body: string }[];
  items: { kind: 'rate_prompt' | 'conversation'; conversation_id: number; external_id: string; title: string; by: string; last_message_at: string; unread: boolean }[];
};
export type InboxItem = { id: number; externalId: string; title: string; by: string; ago: string; unread: boolean };
export type Inbox = { greeting: string; unread: number; actions: { key: string; title: string; body: string }[]; items: InboxItem[] };
export type Reply = { content: string; action: { label: string; to: string } | null };

const UNITS = [
  ['day', 86400],
  ['hour', 3600],
  ['minute', 60],
] as const;

function ago(iso: string) {
  const seconds = Math.max(0, (Date.now() - Date.parse(iso)) / 1000);
  for (const [unit, size] of UNITS) {
    const n = Math.floor(seconds / size);
    if (n >= 1) return `${n} ${unit}${n > 1 ? 's' : ''} ago`;
  }
  return 'just now';
}

const toInbox = (r: ApiInbox): Inbox => ({
  greeting: r.greeting,
  unread: r.unread,
  actions: r.actions,
  items: r.items.map((i) => ({ id: i.conversation_id, externalId: i.external_id, title: i.title, by: i.by, ago: ago(i.last_message_at), unread: i.unread })),
});

export type VoiceReply = {
  transcript: string;
  user_message_id: number;
  message: { id: number; role: 'assistant'; content: string; route: string; created_at: string };
  action: { action: 'navigate'; to: string; label: string } | null;
  /** The spoken answer as base64 WAV (24 kHz mono), null when synthesis failed. */
  audio: string | null;
  audio_mime: string;
};

/** Sends a recorded question: speech to text, the assistant's answer and that answer as speech, all on the server. */
export async function sendVoice(conversationId: number, uri: string, mime = 'audio/wav'): Promise<VoiceReply> {
  // The OS uploads the file itself: React Native's fetch cannot stream a file URI into multipart on Android.
  const res = await uploadAsync(`${API_URL}assistant/conversations/${conversationId}/voice/`, uri, {
    httpMethod: 'POST',
    uploadType: FileSystemUploadType.MULTIPART,
    fieldName: 'audio',
    mimeType: mime,
    headers: apiHeaders(),
  });
  let data: unknown = null;
  try {
    data = res.body ? JSON.parse(res.body) : null;
  } catch {
    data = null;
  }
  if (res.status < 200 || res.status >= 300) {
    const body = (data ?? {}) as { code?: string; detail?: string };
    throw new ApiError(res.status, body.code ?? 'http_error', body.detail ?? `Upload failed (${res.status})`);
  }
  return data as VoiceReply;
}

export const getInbox = () => api<ApiInbox>('assistant/inbox/').then(toInbox);
export const createConversation = () => api<{ id: number }>('assistant/conversations/', { method: 'POST', body: { source: 'mobile' } });
/** Asks for the single-body answer; the default is a server-sent stream. */
export const sendMessage = (conversationId: number, content: string) =>
  api<{ message: { content: string }; action: { label: string; to: string } | null }>(`assistant/conversations/${conversationId}/messages/`, {
    method: 'POST',
    body: { content, source: 'mobile' },
    accept: 'application/json',
  }).then((r): Reply => ({ content: r.message.content, action: r.action ? { label: r.action.label, to: r.action.to } : null }));
