# apps.sim

SIM settings tree: line, line status, call forwarding, roaming toggle,
SMS settings, PUK codes, services, eSIM.

## Structure

| Path | Contents |
|---|---|
| `models/line.py` | `LineSettings`, `CallForwarding`, `RoamingSettings`, `SmsSettings`, `PukCodes` |
| `models/services.py` | `SimService`, `SimServiceSubscription` |
| `models/esim.py` | `EsimRequest` `:todo` |
| `services/line.py` | `overview`, `update_line`, `update_forwarding`, `close_line` `:todo` |
| `services/roaming.py` | `set_roaming(subscriber, enabled)`, `search_countries` `:todo` |
| `services/sms.py` | `update_sms` |
| `services/services.py` | `subscribe(subscriber, service)` → `wallet.charge`, `deactivate` `:todo` |
| `services/esim.py` | `transfer` `:todo`, `recover` `:todo` |
| `views.py` | see [api/sim](../api/sim.md) |

## Business rules

- **Overview** (`/sim-settings`): badge "4G (LTE) enabled", "One-way
  blocking 25 October 2026", "Deactivation date 23 January 2027", six
  rows (Line, Roaming, eSIM, SMS, PUK, Services). The page shows a
  skeleton first; the API is one call.
- **Line settings**: status "Open", Mobile internet (on), Second line
  (on), Call forwarding "Status: Off"; "Request automatic internet
  settings" is `:todo`.
- **Line status**: fee 20.00 ₼, suspend until 23 January 2027, four
  consequences; "Close line" is `:todo`.
- **Call forwarding**: turning "All calls" on sets the other three to
  off and locks them; the API enforces the same rule server-side.
- **Roaming**: toggle persisted; the green "Roaming: ON/OFF" strip is a
  client animation. Country pricing search is `:todo`. Roaming packs are
  served and purchased by [packs](packs.md).
- **SMS settings**: language `az|en|ru` (default `az`), toggles ads /
  campaigns / partners (all on).
- **PUK**: `PUK 1 5839 0447`, `PUK 2 8815 4421`; stored encrypted,
  returned in full to the authenticated owner (the app shows them plainly).
- **Services**: "Buraxılmış zəng" 0.90 ₼ / 30 days, AUTO-RENEWAL, with
  the free "Xəbər ver" option; "Automatic balance" ACTIVATED (activation
  24.09.2026, next payment 24.10.2026, 0.90 ₼). Subscribe charges the
  wallet (`"Buraxılmış zəng service"`); Deactivate is `:todo`.
- **eSIM**: info page (three benefits, Asan İmza note) is static content;
  "Transfer to eSIM" (Asan İmza) and "Recover eSIM" (recovery code +
  number) are `:todo`.

## Seed

One `LineSettings`, `CallForwarding` (all off), `RoamingSettings`
(off), `SmsSettings` (az, all on), `PukCodes`, two `SimService` rows and
one active `SimServiceSubscription` (auto-balance) for the seeded
subscriber.
