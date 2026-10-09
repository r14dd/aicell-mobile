# apps.assistant

Conversation plumbing with a dummy responder. Design in
[Architecture → Assistant](../architecture/assistant.md).

## Structure

| Path | Contents |
|---|---|
| `models.py` | `Conversation`, `Message`, `ConversationRating` |
| `services/conversations.py` | `create`, `list`, `history`, `rate` |
| `services/responder.py` | `respond()` — `DummyResponder` now, `RemoteResponder` later |
| `services/sse.py` | `sse_data`, `sse_event` (copied from aikhan-internal) |
| `services/intents.py` | keyword table for the dummy |
| `views.py` | `ConversationListCreateView`, `MessageListView`, `MessageCreateView` (SSE), `RateView`, `InboxView`, `FeedbackView` `:todo` |
| `tasks.py` | `purge_old_conversations` |

## Dummy intents

| Keywords | Answer built from | Action event |
|---|---|---|
| balance, money, manat | `billing.get_balance` | navigate `/top-up` |
| tariff, istesen, plan | `tariffs.my_tariff` | navigate `/my-tariff` |
| internet, pack, gb | `tariffs.usage` | navigate `/internet-packs` |
| roaming | `sim.roaming` state | navigate `/sim/roaming` |
| top up, pay | — | navigate `/top-up` |
| esim | — | navigate `/esim` |
| operator, human, help | fixed text | none (handoff is `:todo`) |
| (none) | fallback text | none |

All turns are logged with `tokens_* = 0`, `cost = 0`, `route = <intent>`.

## Seed

One closed conversation `#3513323` titled "Rate your conversation", last
message 3 days before the fixture date, unread, so the support screen
shows its inbox card and the "1" badge.
