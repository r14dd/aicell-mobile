# Assistant (dummy AI)

The mobile "Chat with me" robot and the support screen (`/support`) need
a conversation backend. The **real** LLM engine is a separate project
(aikhan-internal's `apps/chat` is the model for it: route classifier,
LangGraph workflows, SSE). This backend ships only the plumbing plus a
dummy responder, so the conversation UI can be built and tested now.

Everything on this page is tagged `:dummy`.

## What is real

- `Conversation` and `Message` persistence,
- the HTTP + SSE contract (same wire format as aikhan-internal's
  `InternalAPIView`, so the real engine can be swapped in without a mobile
  change),
- per-turn logging fields (`route`, `tokens_in`, `tokens_out`, `cost`,
  `latency_ms`) — written as zeros by the dummy,
- the inbox the support screen shows ("Rate your conversation", unread
  badge),
- conversation rating.

## What is dummy

`apps/assistant/services/responder.py` exposes one function:

```python
def respond(conversation: Conversation, user_message: Message) -> Iterator[ResponderEvent]:
    """Yield text chunks (and optional actions) for the latest user turn."""
```

The dummy implementation:

1. lower-cases the question and matches a keyword table
   (`balance`, `tariff`, `pack|internet`, `roaming`, `top up`, `esim`,
   `help|operator`),
2. for a hit, formats a canned answer from the subscriber's real data
   (balance, tariff name, remaining GB) read through the other apps'
   services,
3. otherwise answers a fixed fallback ("I can help with balance, tariffs,
   packs and roaming. What would you like to know?"),
4. yields the answer in small chunks with a 30 ms delay to exercise the
   streaming UI,
5. may yield one `action` event, e.g. `{"action": "navigate", "to": "/top-up"}`,
   which the mobile client can use to deep-link.

No OpenAI key, no vector store, no router. Replacing the dummy is a
single import swap in `responder.py` (`RESPONDER_BACKEND = "dummy" |
"remote"`); the remote backend forwards the turn to the real service
with a static service token and relays its SSE stream.

## Wire format

Request (`POST /api/assistant/conversations/<id>/messages/`):

```json
{ "content": "How much internet do I have left?", "source": "mobile" }
```

Response: `text/event-stream`

```
event: message
data: {"message_id": 812, "role": "user"}

data: {"text": "You have "}
data: {"text": "7.20 GB "}
data: {"text": "left until 25 October."}

event: action
data: {"action": "navigate", "to": "/remaining-balance", "label": "Open remaining balance"}

event: log
data: {"message_id": 813, "route": "usage", "tokens_in": 0, "tokens_out": 0, "cost": 0}

event: done
data: {}
```

`data:` lines without an `event:` are text chunks, exactly like
`sse_data({"text": chunk})` in aikhan-internal. The client concatenates
them into the assistant bubble.

## Inbox (support screen)

`GET /api/assistant/inbox/` returns what `/support` renders today:

```json
{
  "greeting": "How can we support you?",
  "unread": 1,
  "items": [
    { "conversation_id": 3513323, "external_id": "#3513323",
      "title": "Rate your conversation", "by": "AI Chat Bot",
      "last_message_at": "2026-10-05T10:00:00Z", "unread": true,
      "kind": "rate_prompt" }
  ]
}
```

The three cards ("Rate your conversation", "Ask a question", "Share your
ideas for new features") map to: open the rating sheet, create a
conversation, `POST /api/assistant/feedback/` `:todo`.

## Future hooks (not built)

- voice: `POST .../messages/audio/` → STT → text turn (aikhan has
  `helpers/audio/stt.py`), `:todo`,
- operator handoff: `{"redirect": {...}}` event, `:todo`,
- "Hey Aicell" wake word is a mobile dev-build concern, not backend.
