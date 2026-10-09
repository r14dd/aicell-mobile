# Getting Started — Overview

## What this backend is

A single Django project that serves the Azercell self-care mobile app
(Expo, this repository). It owns:

- subscriber identity and sessions (MSISDN + OTP, JWT),
- the wallet: balance, top-ups, purchases, transaction history,
- the catalogue: tariffs, internet / social / roaming packs, credit products,
  SIM services,
- subscriber state: current tariff, usage, SIM settings, notifications,
  viewed stories,
- CMS-like content: stories, banners, lottery rules, games, app offers,
- a **dummy** assistant (conversation API with canned answers).

It does **not** talk to a real BSS / billing core yet. Every action that
moves money or changes a line setting is applied to the backend's own
database and marked where a BSS call will later go (`# TODO(bss)`).

## Stack (same as aikhan-internal)

| Concern | Choice |
|---|---|
| Framework | Django 5.2, Django REST Framework 3.15 |
| Auth | `djangorestframework-simplejwt` (Bearer), static service tokens (`Token <key>`) |
| DB | PostgreSQL (prod/test), SQLite (dev) |
| Cache / locks | Redis via `django-redis` |
| Async | Celery + Redis broker (OTP SMS, provisioning stubs, nightly jobs) |
| Schema | `drf-spectacular` (`/api/schema/`, `/api/swagger/`) |
| Admin | `/mgmt/` |
| Docs | MkDocs Material, `docs/` (this folder) |
| Settings | `django-environ`, `.env` |

Channels / websockets are **not** needed: the assistant streams with
Server-Sent Events through `StreamingHttpResponse`, exactly like
`apps/chat/services/sse.py` in aikhan-internal.

## Repository layout to create

```
azercell-backend/
├── config/            settings.py, urls.py, asgi.py, wsgi.py, celery.py
├── api/               thin URL routing only, one package per domain
│   ├── urls.py
│   ├── users/urls.py
│   ├── billing/urls.py
│   ├── tariffs/urls.py
│   ├── packs/urls.py
│   ├── kredit/urls.py
│   ├── sim/urls.py
│   ├── content/urls.py
│   ├── referral/urls.py
│   └── assistant/urls.py
├── apps/              models, serializers, services, views per domain
│   ├── users/
│   ├── billing/
│   ├── tariffs/
│   ├── packs/
│   ├── kredit/
│   ├── sim/
│   ├── content/
│   ├── referral/
│   ├── assistant/
│   └── taskapp/       celery app + beat schedule
├── docs/              this folder
├── fixtures/          seed data taken from the mobile mock files
├── manage.py
├── requirements.txt
└── mkdocs.yml
```

## Seed data

The mobile app ships with one subscriber and a fixed catalogue. The
backend seeds the same values so the app looks identical after the switch:

| Source file (mobile) | Seeds |
|---|---|
| `src/data/mock.ts` | subscriber `051 664 33 42`, balance `16.21`, top-ups this month `16.00`, referral code `wa16Kg`, hot tariffs, app offers, Aztelekom card, banners, story shelf |
| `src/data/tariffs.ts` | DigiMax / Premium+ families and plans, overage rates, premium benefits |
| `src/data/myTariff.ts` | IsteSen tariff, usage rows, payment details, redesign sliders, change-tariff groups |
| `src/data/internetPacks.ts` | pack categories, packs, social packs and plans |
| `src/data/kredit.ts` | credit products, amounts and fees, Tamamla steps |
| `src/data/simSettings.ts`, `src/data/simServices.ts` | line texts, forwarding rows, roaming packs, SMS settings, PUK codes, services |
| `src/data/notifications.ts` | three notifications |
| `src/data/topUps.ts` | fifteen historical top-ups |
| `src/data/lottery.ts` | lottery rules sections |
| `src/data/games.ts` | games and reward games |
| `src/data/stories.ts` | seven stories with pages |

Fixtures live in `fixtures/*.json` and are loaded with
`manage.py loaddata`. Images referenced by stories, banners and games are
served from `MEDIA_ROOT` (copied from `assets/images/ref/`).

## How the mobile app switches to the API

| Mobile today | Backend replacement |
|---|---|
| `AccountProvider` (`src/state/account.tsx`): `balance`, `topUpsThisMonth`, `transactions`, `topUp()`, `charge()` | `GET /api/billing/balance/`, `GET /api/billing/transactions/`, the top-up endpoints, and the purchase endpoints of packs / sim / tariffs |
| `SteamProvider` | `GET /api/billing/steam/accounts/`, `POST /api/billing/steam/top-up/` |
| `StoriesProvider` (viewed set) | `POST /api/content/stories/<key>/viewed/` |
| local `useState` toggles on SIM pages | `PATCH /api/sim/...` |
| static `src/data/*.ts` | `GET` catalogue and content endpoints |

The client keeps its optimistic UI (toast, immediate balance change) and
reconciles with the response body, which always returns the new balance.

## Local run

```
cp .env.example .env
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py loaddata fixtures/*.json
python manage.py runserver 0.0.0.0:8000
```

Mobile: set `EXPO_PUBLIC_API_URL=http://<lan-ip>:8000/api` and log in
with `051 664 33 42` / OTP `000000` (DEBUG only, see
[Authentication](../architecture/authentication.md)).
