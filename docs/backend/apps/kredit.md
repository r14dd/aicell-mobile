# apps.kredit

Credit products (SimKredit, SimTaksit, InternetKredit, EkstraKredit),
the subscriber's debt and the Tamamla (akart) page.

## Structure

| Path | Contents |
|---|---|
| `models.py` | `CreditProduct`, `CreditDebt`, `TamamlaStep` |
| `services/credit.py` | `products()`, `debt(subscriber)`, `take(subscriber, product)` `:todo` |
| `views.py` | see [api/kredit](../api/kredit.md) |

## Business rules

- Get Kredit page: "Debt" card (`0.00 ₼`, "no items" when empty) and
  four products with chip, chip icon and subtitle exactly as in
  `src/data/kredit.ts`.
- Detail pages: SimKredit 1–3 ₼ (amount chosen, repaid at next top-up),
  SimTaksit 2 ₼ + 0.60 ₼ fee (32 days by 0.08 ₼), InternetKredit 300 MB /
  7 days for 2.00 ₼, EkstraKredit 1 ₼ + 0.40 ₼ fee.
- **Taking a credit is `:todo`.** The mobile button only toasts "… will
  be added at your next top-up (prototype)". When implemented: create
  `CreditDebt`, credit the wallet (`kind=credit`), and for InternetKredit
  create a `PackActivation` instead of a balance credit.
- Repayment on next top-up (`# TODO(bss)`): the wallet `top_up` service
  first settles open `CreditDebt` rows, then credits the remainder.
- Tamamla: three steps and the akart banner; "Get now!" is an external
  link (`https://links.akart.az/app/`) returned by the API so the store
  URL can change without an app release.

## Seed

| slug | chip | price / amount | fee |
|---|---|---|---|
| simkredit | 1-3 ₼ | 1–3 | — |
| simtaksit | 2 ₼ | 2 | 0.60 |
| internetkredit | 300 MB | 2.00 | 7 days |
| ekstrakredit | 1 ₼ | 1 | 0.40 |
