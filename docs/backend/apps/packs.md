# apps.packs

Internet packs (unlimited / high-volume / weekly / daily), social packs
(Tehsil, Instagram & Facebook, TikTok, YouTube) and roaming packs, plus
their activation against the wallet.

## Structure

| Path | Contents |
|---|---|
| `models/catalogue.py` | `PackCategory`, `InternetPack`, `SocialPack`, `SocialPackPlan`, `RoamingPack` |
| `models/activation.py` | `PackActivation` |
| `services/catalogue.py` | `internet_catalogue`, `top_packs`, `social_pack`, `roaming_packs` |
| `services/purchase.py` | `purchase_internet`, `activate_social`, `purchase_roaming` — each calls `wallet.charge` then creates `PackActivation` |
| `views.py` | see [api/packs](../api/packs.md) |
| `tasks.py` | `expire_activations`, `renew_activations` `# TODO(bss)` |

## Business rules

- Transaction titles match the app: `"<label> pack"` for internet packs
  ("Unlimited 1 hour pack"), `"<pack title> <plan title>"` for social
  plans ("Tehsil 10 GB"), `"Roaming <name> pack"` for roaming.
- Validity: unlimited packs by hours (1 h, 3 h), high-volume 28 days,
  weekly 7 days, daily 24 h; social plans "1 d." or "30 d."; roaming 3 /
  10 / 30 / 30 days.
- `renews=true` packs get `auto_renew=true` on the activation; the beat
  job re-charges on expiry (`# TODO(bss)`), and a failed re-charge sets
  `status=expired`.
- Tehsil is `Subscribe` with `AUTO-RENEWAL`; the three social media packs
  are `Activate`.
- The Products tab "TOP internet packs" (1 hour 0.99, Daily 350 MB 0.99,
  Daily 1.5 GB 1.99) is a read of the same catalogue with `is_top=true`;
  its "Buy" button is `:todo` on mobile but maps to the same purchase
  endpoint.
- Roaming purchase goes through the confirmation sheet ("You are not yet
  in the roaming area …"); the backend does not re-check location.
- Active packs listing (`GET active/`) is `:todo` — no mobile screen shows
  it yet.

## Seed

From `src/data/internetPacks.ts` and `roamingPacks` in
`src/data/simSettings.ts`:

- unlimited: 1 hour 0.99, 3 hours 1.99,
- high-volume: 3 GB 9, 6 GB 12, 12 GB 19, 30 GB 29, 56 GB 39 (28 days, renew),
- weekly: 2 GB 4,
- daily: 350 MB 0.99, 1.5 GB 1.99 (renew),
- social: Tehsil (10 GB 0.70 / 1 d., 100 GB 9.90 / 30 d.), Instagram &
  Facebook (500 MB 0.75, 1 GB 1.20, 2 GB 2.00), TikTok and YouTube (1 GB
  1.50, 2 GB 2.50, 5 GB 5.00),
- roaming: 500 MB 10 (3 days), 2 GB 25 (10 days), 5 GB 50, 10 GB 75 (30 days),
- promo card "Unlimited entertainment is waiting for you! For only 0.99 ₼".
