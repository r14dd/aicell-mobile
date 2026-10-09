# Apps Reference — Overview

One Django app per domain under `apps/`, each with a matching pure-routing
package under `api/<domain>/`.

| App | One-line summary | Status |
|---|---|---|
| [users](users.md) | `Subscriber` (custom user), OTP login, JWT, request log | `ready` for profile, `:todo` for login |
| [billing](billing.md) | Wallet, transactions, top-ups (card / akart / voucher / Google Pay), saved cards, Steam top-up | `ready` |
| [tariffs](tariffs.md) | Tariff catalogue, subscriber's tariff (IsteSen), usage, redesign, change, renew, Premium | `ready` reads, `:todo` writes |
| [packs](packs.md) | Internet / social / roaming packs and their activation | `ready` |
| [kredit](kredit.md) | Credit products, debt, Tamamla | `ready` reads, `:todo` take |
| [sim](sim.md) | Line, call forwarding, roaming toggle, SMS settings, PUK, services, eSIM | `ready` |
| [content](content.md) | Stories, banners, notifications, lottery rules, games, offers, campaigns, app rating | `ready` |
| [referral](referral.md) | Invite & earn | `ready` read |
| [assistant](assistant.md) | Conversations with a dummy responder, SSE streaming, inbox | `:dummy` |
| `taskapp` | Celery app and beat schedule (no endpoints) | — |

Shared rules:

- money only moves through `apps.billing.services.wallet`,
- every app's `services/` is the only place with business logic,
- every endpoint is listed in the matching [API page](../api/overview.md).
