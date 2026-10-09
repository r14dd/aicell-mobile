# apps.billing

The wallet. Replaces `src/state/account.tsx` and `src/state/steam.tsx`.

## Structure

| Path | Contents |
|---|---|
| `models/wallet.py` | `Wallet`, `Transaction`, `IdempotencyKey` |
| `models/top_up.py` | `TopUp`, `SavedCard`, `SavedAkart` |
| `models/steam.py` | `SteamAccount`, `SteamTopUp` |
| `services/wallet.py` | `get_balance`, `top_up`, `charge`, `InsufficientBalance` |
| `services/top_up.py` | `top_up_card`, `top_up_akart`, `top_up_voucher` `:todo`, `top_up_google_pay` |
| `services/steam.py` | `steam_top_up(subscriber, account_name, amount, save)` |
| `services/idempotency.py` | `@idempotent` decorator for views |
| `views.py` | one view per endpoint in [api/billing](../api/billing.md) |
| `tasks.py` | `expire_idempotency_keys` |

## Wallet service

```python
def top_up(wallet, amount: Decimal, *, method: str, title="Number balance", reference=None) -> Transaction
def charge(wallet, amount: Decimal, *, title: str, reference=None) -> Transaction  # raises InsufficientBalance
```

Both run inside `transaction.atomic()` with
`Wallet.objects.select_for_update()`. Amounts are quantised to `0.01`.
`charge` raises when `amount > balance`; the view maps it to
`402 insufficient_balance` with the message the app already shows
("Not enough balance for this pack", "Not enough balance for this service").

## Top-up methods

| Method | Mobile screen | Backend now | Later (`# TODO(bss)` / acquirer) |
|---|---|---|---|
| Bank card | `/top-up/card`: first 6 digits + amount → Continue | credits immediately, stores `card_bin` | redirect to acquirer, webhook completes the `TopUp` |
| akart | `/top-up/akart`: +994 number + amount + "Save akart number" | credits immediately, saves `SavedAkart` when asked | akart API |
| Voucher | `/top-up/voucher`: 13-digit code | `:todo` (mobile only toasts) | voucher validation service |
| Google Pay | `/top-up/gpay` → simulated checkout sheet → "Payment completed" | accepts `{amount, payment_token}`; the dummy token `"simulated"` is accepted in DEBUG | verify the Google Pay token with the acquirer |

Every successful top-up inserts a `TopUp` row and a positive
`Transaction` titled "Number balance", and bumps the Home "Top-ups in
<month>" sum.

## Steam

`/steam` lists saved accounts; `/steam/top-up` takes a Steam login and an
amount (chips 5 / 10 / 25 / 50, limits 1.00–50.00). The mobile prototype
does **not** deduct the balance for Steam; the backend does
(`charge(title="Steam balance <account>")`) because the Payments tab
advertises "No VAT or commission fees" — a balance payment. Saving the
account upserts `SteamAccount` by case-insensitive name and moves it to
the top.

## Payments tab

| Action | Status |
|---|---|
| Balance card, "Top up <amount> ₼" quick chips | `:todo` (toasts "Card payment is not part…") — same `POST top-up/card/` once a default card exists |
| History button | `:todo` → `GET payments/` |
| Pay for another number | `:todo` → `POST pay/number/` |
| Steam balance | `ready` |
| Aztelekom home internet | `:todo` → `POST pay/aztelekom/` |
| Utilities | `:todo` → `POST pay/utilities/` |
| Saved cards list (ending 4471, 09/28) | `ready` read |
| Add card, card settings | `:todo` |
| Recent payments | `ready` = `GET transactions/` |

## Seed

- `Wallet.balance = 16.21`,
- `Transaction`: `Number balance +15.00` (02 Oct), `Number balance +1.00` (02 Oct),
- fifteen `TopUp` rows from `src/data/topUps.ts` (02 Oct 2026 16:39 15.00 … 23 Apr 2026 09:20 16.00),
- `SavedCard`: brand `mastercard`, last4 `4471`, expiry `09/28`, default.
