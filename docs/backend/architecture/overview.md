# Architecture — Overview

The project copies the shape of `aikhan-internal`: one Django project
(`config/`), one Django app per business domain under `apps/`, and a thin
`api/` layer that only wires URLs to views defined in `apps/`.

## `api/` vs `apps/`

Every domain has a matching pair:

- `apps/<domain>/` — `models/`, `serializers/`, `services/`, `views.py`,
  `permissions.py`, `admin.py`, `tests/`
- `api/<domain>/urls.py` — pure routing, imports views from
  `apps/<domain>` and mounts them under `/api/<domain>/...`

```python
# api/urls.py
urlpatterns = [
    path("users/",     include("api.users.urls")),
    path("billing/",   include("api.billing.urls")),
    path("tariffs/",   include("api.tariffs.urls")),
    path("packs/",     include("api.packs.urls")),
    path("kredit/",    include("api.kredit.urls")),
    path("sim/",       include("api.sim.urls")),
    path("content/",   include("api.content.urls")),
    path("referral/",  include("api.referral.urls")),
    path("assistant/", include("api.assistant.urls")),
    path("schema/",    SpectacularAPIView.as_view(), name="schema"),
    path("swagger/",   SpectacularSwaggerView.as_view(url_name="schema")),
]
```

`config/urls.py` mounts `api/` under `/api/`, the admin under `/mgmt/`
and `MEDIA_ROOT` under `/media/`.

## Layering inside an app

| Layer | Rule |
|---|---|
| `views.py` | Thin. Validate with a serializer, call one service function, return a serializer of the result. No business logic. |
| `services/` | All business rules. Pure functions or small classes that take the `Subscriber` and validated data. This is where `# TODO(bss)` hooks live. |
| `models/` | One file per model group. Money is `DecimalField(max_digits=10, decimal_places=2)`. |
| `serializers/` | Input serializers (`*Request`) and output serializers (`*Response`) kept separate. |
| `permissions.py` | App-specific DRF permissions (see [Authentication](authentication.md)). |

## Request flow — a purchase

Every money-moving action (pack purchase, service subscription, Steam
top-up, credit) goes through one service, `apps.billing.services.wallet`,
so the balance rules exist exactly once. This mirrors the mobile
`AccountProvider.charge()` which every screen calls today.

```mermaid
sequenceDiagram
    participant M as Mobile
    participant V as PackPurchaseView (apps/packs/views.py)
    participant P as packs.services.purchase
    participant W as billing.services.wallet
    participant DB as PostgreSQL
    participant C as Celery (provisioning stub)

    M->>V: POST /api/packs/internet/purchase/ {pack_id} + Idempotency-Key
    V->>P: purchase(subscriber, pack, idempotency_key)
    P->>W: charge(subscriber, amount, title, ref)
    W->>DB: SELECT ... FOR UPDATE wallet
    alt balance >= amount
        W->>DB: balance -= amount; INSERT Transaction(amount=-x)
        W-->>P: Transaction
        P->>DB: INSERT PackActivation(status=active)
        P->>C: provision_pack.delay(activation_id)  # TODO(bss)
        P-->>V: {activation, balance}
        V-->>M: 201 {activation, balance, transaction}
    else
        W-->>P: InsufficientBalance
        V-->>M: 402 {"code": "insufficient_balance", "detail": "Not enough balance for this pack"}
    end
```

Rules copied from the mobile prototype:

- amounts are rounded to two decimals before any comparison,
- a purchase that cannot be afforded fails and nothing is written,
- a successful top-up or purchase inserts one `Transaction` row; top-ups
  are positive, purchases negative, titles are the strings the app shows
  today ("Number balance", "Unlimited 1 hour pack", "Roaming 2 GB pack",
  "Buraxılmış zəng service", …),
- every response that changes money returns the new `balance`.

## Idempotency

`POST` endpoints that move money accept an `Idempotency-Key` header
(UUID from the client). The key is stored in `billing.IdempotencyKey`
with the serialized response for 24 h; a retry with the same key returns
the stored response without charging twice.

## Process topology

| Process | Entrypoint | Protocol |
|---|---|---|
| Web/API | `config.wsgi:application` (gunicorn) | HTTP + SSE |
| Celery worker | `apps.taskapp.celery` | — |
| Celery beat | `apps.taskapp.celery` | — |

## Data stores

| Store | Used for |
|---|---|
| PostgreSQL / SQLite (dev) | all ORM models |
| Redis (cache DB) | OTP codes (TTL), idempotency keys, catalogue cache, rate limits |
| Redis (Celery DBs) | broker and result backend |
| `MEDIA_ROOT` (later MinIO) | story, banner, game and logo images |

## Background jobs (Celery beat)

| Job | Schedule | Purpose |
|---|---|---|
| `billing.expire_idempotency_keys` | hourly | drop keys older than 24 h |
| `packs.expire_activations` | hourly | mark activations whose `expires_at` passed; `renews=true` packs re-charge and re-activate (`# TODO(bss)`) |
| `tariffs.renew_due_tariffs` | daily 00:00 Asia/Baku | charge the monthly fee on `next_payment_at`, reset usage (`# TODO(bss)`) |
| `content.publish_scheduled` | every 5 min | flip `Story`/`Banner` with `publish_at <= now` to published |
| `assistant.purge_old_conversations` | daily | delete dummy conversations older than 30 days |

## Logging

Every request is written by a middleware to `users.RequestLog`
(path, method, status, latency, subscriber id, app version) — the same
role `apps.logs.RequestLog` plays in aikhan-internal. Assistant turns are
logged on `assistant.Message` (see [Assistant](assistant.md)).
