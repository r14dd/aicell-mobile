# apps.content

Everything editorial: stories, banners, notifications, lottery rules,
games, app offers, Aztelekom, partner perks, campaigns, app rating.

## Structure

| Path | Contents |
|---|---|
| `models/stories.py` | `Story`, `StoryView` |
| `models/banners.py` | `Banner` |
| `models/notifications.py` | `Notification`, `NotificationRead` |
| `models/lottery.py` | `LotterySection` |
| `models/games.py` | `Game`, `Tournament` |
| `models/offers.py` | `AppOffer`, `AztelekomOffer`, `Campaign`, `PartnerPerk` |
| `models/rating.py` | `AppRating` |
| `services/home.py` | `home_feed(subscriber)` — shelf order with viewed stories last, banners, quick actions |
| `services/notifications.py` | `list(subscriber, q, from, to)`, `mark_read` |
| `views.py` | see [api/content](../api/content.md) |
| `tasks.py` | `publish_scheduled` |

## Business rules

- **Story shelf order** is fixed (Gift Wheel, "30 il səninlə", Wolt+,
  Roaming, Especially for you, Applications, Dark Mode); stories the
  subscriber has viewed are moved to the end, ring dimmed. Viewing is
  persisted per subscriber (today it is session-only in
  `StoriesProvider`).
- **Story pages** are stored as JSON in the exact `StoryPage` shape the
  renderer (`src/app/story/[key].tsx`) consumes: `title`, `subtitle`,
  `subtitle2`, `caption`, `gradient`, `horizontal`, `items`, `brands`,
  `bullets`, `rows`, `tariffCards`, `gift`, `photo`, `art`, `artPosition`,
  `artAlign`, `artHeight`, `grouped`, `hot`, `cta`. Images are URLs.
- **Banners** carry a `deep_link` only when the target screen exists
  (`/kredit/tamamla`, `/tariffs/premium-plus`, `/tariffs/digimax`,
  `/esim`, `/invite`, `/steam`, `/games`); otherwise `deep_link=null`
  and the client shows its "not part of this prototype yet" notice. The
  Gift Wheel, Wingz and Mobile Sales banners are in that state (`:todo`).
- **Notifications**: three seeded (Wingz 27 Oct 2025, Gift Wheel 31 Mar
  2022, gift 31 Dec 2021 with CTA "Got it"). List supports text search
  and an inclusive date range (the picker's `start`/`end`). Grouping by
  date is done by the client. "Got it" and opening a detail mark it read.
  The header "options" menu is `:todo`.
- **Lottery rules**: seven sections (About, How to earn chances, When are
  chances added, How is the winner chosen, What prizes, When are winners
  announced, Important information) with `p`, `example`, `bullets`,
  `note`, `link` blocks. The terms link is `:todo`; chance balance is
  `:todo` (no mobile screen).
- **Games**: eight games, one reward game (Battle for GB), tournament
  card (prize 5 GB, participants 6 708, countdown `ends_at`). Launching a
  game, joining the tournament, tournament rules and search are `:todo`.
- **App offers** (Kinon from 0.40, Yandex Plus from 0.25, Litres from
  0.15), **Aztelekom** (Fiber Optical 33–57 ₼, Internet + TV + Telephony,
  100–500 Mbit/s), **partner perks** (Wingz, Wolt+), **campaigns**
  (Azercellim.com) are read-only; all their CTAs are `:todo`.
- **Gift Wheel** (Benefits hero) spin is `:todo`.
- **App rating**: 1–5 stars from the "Rate the app" sheet; `ready`.
- **About Azercell, Map, Stickers, Help & Support, Report a problem** are
  `:todo` (More tab rows).

## Seed

From `src/data/mock.ts`, `stories.ts`, `notifications.ts`, `lottery.ts`,
`games.ts`. Images copied from `assets/images/ref/` into `MEDIA_ROOT`.
