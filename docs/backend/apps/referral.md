# apps.referral

Invite & earn.

## Structure

| Path | Contents |
|---|---|
| `models.py` | `ReferralProfile`, `ReferralEvent` `:todo` |
| `services.py` | `profile(subscriber)` (creates the code on first call), `register_event` `:todo`, `qualify_event` `:todo` |
| `views.py` | `MeView`, `TermsView` `:todo`, `EventWebhookView` `:todo` (service token) |

## Business rules

- Code is 6 alphanumerics (`wa16Kg`), unique, generated once.
- Share message: "Join me on the Azercell app and use my referral code
  <code>" plus `share_url`.
- Steps (three) and the headline "Share Azercell app and get 3.00 ₼
  bonus!" are returned by the API so copy can change server-side.
- Bonus rule (from the steps): referrer gets 3.00 ₼ on the wallet
  (`Transaction kind=credit`, title "Referral bonus"), the friend gets
  5 GB, once the friend registers through the link and uses a paid
  service within 24 h. The whole crediting flow is `:todo` — it needs
  the registration webhook from the signup service.
- "Terms of Use" link is `:todo`.

## Seed

`ReferralProfile(code="wa16Kg", earned=0.00)` for the seeded subscriber.
