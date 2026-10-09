# Mobile — Screen map

Every Expo Router route in `src/app/` and the endpoints it calls. `→`
marks a navigation, not an API call. Status is the backend tag of the
*actions* on that screen.

## Tabs

| Route | Reads | Writes / actions | Status |
|---|---|---|---|
| `(tabs)/index` Home | `users/me/`, `billing/balance/`, `tariffs/my/usage/`, `billing/transactions/`, `content/home/`, `content/notifications/` (badge) | eye toggle (client only); Top up → `/top-up`; Remaining balance → `/remaining-balance`; ⓘ → aggregation sheet (copy from `tariffs/my/usage/`); Top-ups row → `/top-ups`; IsteSen row → `/my-tariff`; quick actions → `/kredit`, `/internet-packs`, `/sim-settings`; story chip → `/story/[key]`; banner → `deep_link`; lottery → `/lottery-rules`; robot → `/support`; bell → `/notifications` | `ready` |
| `(tabs)/products` | `tariffs/hot/`, `packs/internet/top/`, `content/offers/apps/`, `content/offers/aztelekom/`, `content/banners/?placement=products` | "Buy" on a top pack → `packs/internet/purchase/`; tariff card → `/tariffs/[id]`; See all (internet, tariffs, apps, Aztelekom), app offer, Aztelekom, category chips (Internet / Tariffs / Roaming) | `ready` reads; CTAs `:todo` except tariff cards |
| `(tabs)/payments` | `billing/balance/`, `billing/cards/`, `billing/transactions/` | Top up chips (`:todo`), History (`:todo`), Another number (`:todo`), Steam → `/steam`, Aztelekom (`:todo`), Utilities (`:todo`), Add card (`:todo`), card row (`:todo`) | mixed |
| `(tabs)/benefits` | `content/gift-wheel/` (`:todo`), `content/perks/`, `content/campaigns/`, `content/banners/?placement=benefits` | Spin (`:todo`), campaign (`:todo`), Premium banner → `/premium` | reads `ready` |
| `(tabs)/more` | `users/me/` | profile (`:todo`), Asan Imza (`:todo`), Invite → `/invite`, SIM settings (`:todo` row; page exists), App settings (`:todo`), Help & Support (`:todo`), Report a problem (`:todo`), Map (`:todo`), Stickers (`:todo`), About (`:todo`), Rate the app → `content/app-rating/`, Sign out → `users/logout/` (`:todo`) | mixed |

## Stories and content

| Route | Reads | Actions | Status |
|---|---|---|---|
| `story/[key]` | `content/stories/<key>/` (with `next_key`/`prev_key`) | `content/stories/<key>/viewed/` on open; page CTAs with `deep_link` navigate, others show the notice | `ready` |
| `notifications/index` | `content/notifications/?q=&from=&to=` | options menu (`:todo`) | `ready` |
| `notifications/[id]` | `content/notifications/<id>/` | "Got it" → `content/notifications/<id>/read/` | `ready` |
| `lottery-rules` | `content/lottery/rules/` | terms link (`:todo`) | `ready` |
| `games` | `content/games/` | game tap (`:todo`), search (`:todo`), rules (`:todo`), Participate (`:todo`) | reads `ready` |
| `premium` | `tariffs/premium/` | Continue → `tariffs/premium/activate/` (`:todo`) | reads `ready` |
| `invite` | `referral/me/` | copy / share (client), Terms (`:todo`) | `ready` |
| `support` | `assistant/inbox/` | Rate → `assistant/conversations/<id>/rate/`, Ask → `assistant/conversations/` + messages SSE, Ideas → `assistant/feedback/` (`:todo`), tabs (client) | `:dummy` |

## Billing

| Route | Reads | Actions | Status |
|---|---|---|---|
| `top-up/index` | `billing/top-up/methods/` | rows → `/top-up/card`, `/top-up/akart`, `/top-up/voucher`, `/kredit`; Google Pay → `/top-up/gpay`; banner → `/kredit/tamamla` | `ready` |
| `top-up/card` | — | Continue → `billing/top-up/card/` | `ready` |
| `top-up/akart` | — | Continue → `billing/top-up/akart/` | `ready` |
| `top-up/voucher` | — | Top up mobile → `billing/top-up/voucher/` (`:todo`), scan (`:todo`) | `:todo` |
| `top-up/gpay` | `billing/top-up/methods/` (limits, note) | Pay (sheet) → `billing/top-up/google-pay/` | `ready` |
| `top-ups` | `billing/top-ups/?from=&to=` | date range (client picker) | `ready` |
| `steam/index` | `billing/steam/accounts/` | row → `/steam/top-up?account=` | `ready` |
| `steam/top-up` | `billing/steam/accounts/` (limits, chips) | Send → `billing/steam/top-up/`; help (`:todo`) | `ready` |

## Tariffs and packs

| Route | Reads | Actions | Status |
|---|---|---|---|
| `tariffs/[id]` | `tariffs/catalogue/<family>/?plan=` | Subscribe → `tariffs/subscribe/` (`:todo`); info icons (`:todo`) | reads `ready` |
| `my-tariff/index` | `tariffs/my/` | Manage sheet → `/my-tariff/redesign`, Renew → `tariffs/my/renew/` (`:todo`), `/my-tariff/change`; banner → `/internet-packs`; Local calls ⓘ (`:todo`) | reads `ready` |
| `my-tariff/redesign` | `tariffs/my/redesign/` | Save → `tariffs/my/redesign/` (`:todo`); help (`:todo`) | reads `ready` |
| `my-tariff/change` | `tariffs/change/` | card with `family_id` → `/tariffs/[id]`; others → `tariffs/change/` (`:todo`) | reads `ready` |
| `remaining-balance` | `tariffs/my/usage/` | card → `/my-tariff` | `ready` |
| `internet-packs/index` | `packs/internet/` | Buy → confirm sheet → `packs/internet/purchase/`; social card → `/internet-packs/[id]` | `ready` |
| `internet-packs/[id]` | `packs/social/<slug>/` | Activate / Subscribe → `packs/social/<slug>/activate/` | `ready` |

## Kredit

| Route | Reads | Actions | Status |
|---|---|---|---|
| `kredit/index` | `kredit/` | product → detail | `ready` |
| `kredit/simkredit`, `simtaksit`, `internetkredit`, `ekstrakredit` | `kredit/products/<slug>/` | Get → `kredit/products/<slug>/take/` (`:todo`) | reads `ready` |
| `kredit/tamamla` | `kredit/tamamla/` | Get now! → external `url` | `ready` |

## SIM

| Route | Reads | Actions | Status |
|---|---|---|---|
| `sim-settings` | `sim/` | rows → sub-pages; info icons (`:todo`); search (client filter) | `ready` |
| `sim/line` | `sim/line/` | toggles → `PATCH sim/line/`; status → `/sim/line-status`; forwarding → `/sim/call-forwarding`; internet settings link (`:todo`) | `ready` |
| `sim/line-status` | `sim/line/status/` | Close line → `sim/line/close/` (`:todo`) | reads `ready` |
| `sim/call-forwarding` | `sim/call-forwarding/` | toggles → `PATCH`; help (`:todo`) | `ready` |
| `sim/roaming` | `sim/roaming/`, `packs/roaming/` | toggle → `PATCH sim/roaming/`; Buy → confirm → `packs/roaming/purchase/`; country search (`:todo`) | `ready` |
| `sim/sms` | `sim/sms/` | language sheet + toggles → `PATCH sim/sms/` | `ready` |
| `sim/puk` | `sim/puk/` | — | `ready` |
| `sim/services/index` | `sim/services/` | row → detail | `ready` |
| `sim/services/[id]` | `sim/services/<slug>/` | Subscribe → `sim/services/<slug>/subscribe/`; Deactivate (`:todo`) | `ready` |
| `esim/index` | `sim/esim/` | Transfer → Asan İmza sheet → `sim/esim/transfer/` (`:todo`); Recover → `/esim/recover` | reads `ready` |
| `esim/recover` | — | Continue → `sim/esim/recover/` (`:todo`) | `:todo` |

## Shared components

| Component | Endpoint |
|---|---|
| `TopBar` bell badge | `content/notifications/` `unread` |
| `AvatarButton` (robot) | → `/support` |
| `RateApp` sheet | `content/app-rating/` |
| `HelpCard` ("Any questions left?") | FAQ `:todo` (`content/help/`) |
| `GooglePaySheet` | `billing/top-up/google-pay/` |
| `DatePicker` | client only; produces `from`/`to` |
