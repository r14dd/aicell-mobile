# apps.tariffs

Catalogue of tariff families and the subscriber's own tariff.

## Structure

| Path | Contents |
|---|---|
| `models/catalogue.py` | `TariffFamily`, `TariffPlan`, `OverageRate`, `PremiumBenefit` |
| `models/subscription.py` | `SubscriberTariff`, `UsageCounter`, `RedesignDraft` `:todo` |
| `services/catalogue.py` | `list_families`, `get_family`, `hot_offers` |
| `services/my_tariff.py` | `my_tariff(subscriber)`, `usage(subscriber)`, `remaining_period(subscriber)` |
| `services/change.py` | `change_options`, `subscribe` `:todo`, `renew` `:todo` |
| `services/redesign.py` | `redesign_config`, `estimate(values)`, `save_draft` `:todo` |
| `views.py` | see [api/tariffs](../api/tariffs.md) |
| `tasks.py` | `renew_due_tariffs` (daily) `# TODO(bss)` |

## Business rules

- **Default plan** per family (`defaultPlanId`): `digimax-10`,
  `premium-60`. A `?plan=` query param overrides when valid.
- **Hot offers** on Products: `digimax-10`, `premium-60`, `digimax-25`
  (frame order), each with socials and three or four feature pills.
- **My tariff (IsteSen)**: header lines "Current tariff 19.10 ₼/month",
  "Next renewal 19.10 ₼/month", pills `CURRENT TARIFF`, `PREPAID`;
  usage rows Internet 7.20 / 16 GB, Messaging 1003 MB / 1 GB,
  Local calls 30 / 30 MIN; payment details (validity 30 d., activation
  24.09.2026 00:00, last payment 24.09.2026 00:00, next payment 25.10.2026
  08:00, amount 19.10 ₼); total-price groups (after package / unpaid);
  charging note "Charging interval: 1 minute for calls".
- **Remaining balance page** adds the period left ("18 d. 21 h.") computed
  from `UsageCounter.period_ends_at`.
- **Home card** shows `remaining.dataGb` and `remaining.minutes` and the
  "Balances aggregation" sheet texts (static copy returned with usage).
- **Redesign** sliders: Internet 0–16 GB (16), Local calls 30–350 min
  (30), Instagram & FB 0–5 GB, YouTube 0–10 GB, TikTok 0–10 GB; estimate
  `19.10 + 0.50 × extra GB + 0.02 × extra min` (prototype formula, kept
  until BSS pricing exists). Saving the draft is `:todo`.
- **Change tariff** groups: DigiMax (DigiMax 12–30 ₼ / 28 days, DigiMax
  3GB 8 ₼ / 14 days, Həftəlik 4 ₼ / 7 days, Günlük 1 ₼ / 1 day),
  Premium+ (60–90 ₼, NEW). Cards with a `familyId` open the catalogue
  page; the others are `:todo`.
- **Renew** sheet copy: "By renewing tariff, the remaining balance will be
  annulled but the existing old internet packs will still stay active."
  Action `:todo`.
- **Subscribe** (`Subscribe for 18.00 ₼` on a catalogue page) is `:todo`
  — it will charge the plan price through the wallet and replace
  `SubscriberTariff`.
- **Premium** page lists eight benefits and the note "To access the
  Premium theme you must log in with Premium number as main account";
  "Continue" is `:todo`.

## Seed

`TariffFamily` digimax (PREPAID; plans 5GB 12 ₼, 10GB 18 ₼ hot, 25GB
30 ₼ hot), premium-plus (PREPAID, PREMIUM; 60GB 60 ₼, 100GB 90 ₼ hot),
istesen (the subscriber's current family, 19.10 ₼ / 30 days). Overage
rates: Internet 1 MB 0.05, Local calls 1 MIN 0.19, Local SMS 0.10,
International calls 1 MIN 0.50, International SMS 0.25. Premium benefits
from `src/data/tariffs.ts`.
