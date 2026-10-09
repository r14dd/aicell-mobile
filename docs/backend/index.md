# Azercell self-care backend (Django) — plan

This folder is the backend plan for the Expo app in this repository. It is
written to be dropped into the new Django project's `docs/` directory as is
(same layout as `aikhan-internal/docs`, MkDocs-ready).

The **mobile app is the source of truth**: every screen, action and seed
value below was read from `src/app/**`, `src/data/*.ts` and
`src/state/*.tsx`. Nothing is invented beyond what the app already shows.

## Status legend

Every endpoint and business rule carries one tag:

| Tag | Meaning |
|---|---|
| `ready` | The mobile screen and action exist. The endpoint replaces the current in-memory logic (`AccountProvider`, `SteamProvider`, `StoriesProvider`, local `useState`). Build first. |
| `:todo` | The mobile action still shows an "… is not part of this prototype yet" notice. The endpoint is reserved (path, method, payload) but not implemented. When the mobile side lands, add the matching `.md` section and drop the tag. |
| `:dummy` | Assistant (AI) only. The endpoint works end to end but answers with canned text. The real LLM logic is a separate project and plugs in behind `apps/assistant/services/responder.py`. |

## Reading order

1. [Getting started → Overview](getting-started/overview.md) — stack, repo layout, how the app swaps its mock data for the API.
2. [Architecture → Overview](architecture/overview.md) — `config/` + `apps/` + `api/` pattern copied from aikhan-internal.
3. [Architecture → Authentication](architecture/authentication.md) — MSISDN + OTP → JWT.
4. [Architecture → Data models](architecture/data-models.md).
5. [Architecture → Assistant](architecture/assistant.md) — the dummy conversation engine.
6. [Apps reference](apps/overview.md) — one page per Django app.
7. [API reference](api/overview.md) — one page per domain, every mobile endpoint.
8. [Mobile → Screen map](mobile/screen-map.md) — every Expo route and the endpoints it calls.
9. [Roadmap → TODO](roadmap/todo.md) — every `:todo` in one list.
10. [Reference → Tariffs](reference/tariffs.md) — every tariff in the app: mobile types, Django models, all values, seed diff, replacement seed.

## Nav (for `mkdocs.yml`)

```yaml
nav:
  - Home: index.md
  - Getting Started:
      - Overview: getting-started/overview.md
  - Architecture:
      - Overview: architecture/overview.md
      - Authentication: architecture/authentication.md
      - Data Models: architecture/data-models.md
      - Assistant (dummy AI): architecture/assistant.md
  - Apps Reference:
      - Overview: apps/overview.md
      - users: apps/users.md
      - billing: apps/billing.md
      - tariffs: apps/tariffs.md
      - packs: apps/packs.md
      - kredit: apps/kredit.md
      - sim: apps/sim.md
      - content: apps/content.md
      - referral: apps/referral.md
      - assistant: apps/assistant.md
  - API Reference:
      - Conventions: api/overview.md
      - users: api/users.md
      - billing: api/billing.md
      - tariffs: api/tariffs.md
      - packs: api/packs.md
      - kredit: api/kredit.md
      - sim: api/sim.md
      - content: api/content.md
      - referral: api/referral.md
      - assistant: api/assistant.md
  - Mobile:
      - Screen map: mobile/screen-map.md
  - Reference:
      - Tariffs (full extraction): reference/tariffs.md
  - Roadmap:
      - TODO: roadmap/todo.md
```
