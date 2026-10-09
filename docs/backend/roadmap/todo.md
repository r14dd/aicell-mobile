# Roadmap — every `:todo` in one place

Each item is a mobile action that still shows an "… is not part of this
prototype yet" notice (or has no screen at all). The endpoint path is
reserved and returns `501 not_implemented` with that notice text. When a
flow is recorded and built on mobile, implement the endpoint, add its
section to the domain page, and remove the row here.

## Authentication and account (`users`)

- [ ] OTP login screens → `POST users/otp/send/`, `POST users/otp/verify/`, `POST users/token/refresh/`
- [ ] Sign out (More) → `POST users/logout/`
- [ ] Profile settings (More profile card) → `PATCH users/me/`
- [ ] App settings (More) → `GET/PATCH users/me/app-settings/` (theme for the Dark Mode story)
- [ ] Push token registration → `POST users/devices/`

## Billing

- [ ] Voucher redemption and voucher scan → `POST billing/top-up/voucher/`
- [ ] Real card acquirer + Google Pay token verification (`# TODO(acquirer)`)
- [ ] Saved akart list → `GET billing/akart/`
- [ ] Payments tab top-up chips (card payment) and History → `GET billing/payments/`
- [ ] Pay for another number → `POST billing/pay/number/`
- [ ] Aztelekom home internet payment → `POST billing/pay/aztelekom/`
- [ ] Utilities → `POST billing/pay/utilities/`
- [ ] Add card, card settings → `POST billing/cards/`, `DELETE billing/cards/<id>/`
- [ ] Remove saved Steam account → `DELETE billing/steam/accounts/<id>/`
- [ ] Steam top-up help text

## Tariffs

- [ ] Subscribe to a catalogue plan → `POST tariffs/subscribe/`
- [ ] Renew tariff → `POST tariffs/my/renew/`
- [ ] Save redesign draft → `POST tariffs/my/redesign/` (+ redesign help)
- [ ] Change to a card without a family page (DigiMax 3GB / Həftəlik / Günlük) → `POST tariffs/change/`
- [ ] Premium activation → `POST tariffs/premium/activate/`
- [ ] Feature info icons on catalogue pages, "Local calls details" on IsteSen
- [ ] Nightly renewal job against the real BSS (`# TODO(bss)`)

## Packs

- [ ] Active activations list → `GET packs/active/`
- [ ] Products tab "Buy" (same purchase endpoint, mobile wiring)
- [ ] Full internet pack list ("See all"), full tariff list, category chips (Internet / Tariffs / Roaming)
- [ ] Auto-renew re-charge against BSS (`# TODO(bss)`)

## Kredit

- [ ] Take a credit (all four) → `POST kredit/products/<slug>/take/`
- [ ] Repayment on next top-up (`# TODO(bss)`)

## SIM

- [ ] Request automatic internet settings → `POST sim/line/internet-settings/`
- [ ] Close line → `POST sim/line/close/`
- [ ] Call forwarding help
- [ ] Country pricing search → `GET sim/roaming/countries/?q=`
- [ ] Deactivate a service → `POST sim/services/<slug>/deactivate/`
- [ ] SIM settings info icons, row details (Line / Roaming / … are built; "details" tooltips are not)
- [ ] eSIM transfer (Asan İmza) → `POST sim/esim/transfer/`
- [ ] eSIM recovery → `POST sim/esim/recover/`

## Content

- [ ] Gift Wheel page and spin → `GET content/gift-wheel/`, `POST content/gift-wheel/spin/`
- [ ] Wingz, Wolt+, Mobile Sales and Service, campaign detail pages
- [ ] App offers (Kinon / Yandex Plus / Litres) subscribe, full app catalogue
- [ ] Aztelekom catalogue, Fiber Optical order
- [ ] Notifications options menu → `GET content/notifications/options/`
- [ ] Lottery terms link, lottery chance balance → `GET content/lottery/terms/`, `GET content/lottery/chances/`
- [ ] Games: launch, search, tournament rules, participate
- [ ] About Azercell, Map, Stickers, Help & Support, Report a problem, FAQ (HelpCard)

## Referral

- [ ] Terms of Use → `GET referral/terms/`
- [ ] Registration / qualification webhook and bonus crediting → `POST referral/events/`

## Assistant

- [ ] Replace `DummyResponder` with the remote LLM service (`RESPONDER_BACKEND=remote`)
- [ ] "Share your ideas for new features" → `POST assistant/feedback/`
- [ ] Voice turns (STT), operator handoff event
