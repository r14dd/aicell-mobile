# Reference — Tariffs (complete extraction from the mobile app)

Every tariff the mobile app shows, with the models on both sides and every
value, read from disk on 9 October 2026:

- mobile: `src/data/tariffs.ts`, `src/data/myTariff.ts`, `hotTariffs` in
  `src/data/mock.ts`, `src/data/stories.ts` (Especially for you), `src/api/tariffs.ts`
- backend (`Programs/backend-intro`): `api/tariffs/models.py`,
  `api/tariffs/texts.py`, `api/tariffs/translation.py`,
  `api/seeding/data/tariffs.py`, `api/seeding/subscriber.py`

Section 6 lists where the backend seed still carries placeholder values
instead of the app's data; section 7 is a drop-in replacement seed.

## 1. Where tariffs appear

| Screen (route) | What it shows | Mobile source | Endpoint |
|---|---|---|---|
| Products tab `(tabs)/products` | "Hot offers on tariffs": 3 cards | `hotTariffs` (`mock.ts`) | `GET tariffs/hot/` |
| Tariff page `tariffs/[id]` | family badges, plan chips, feature rows, Total price, note, "Subscribe for X ₼" | `tariffFamilies`, `totalPriceGroups`, `tariffNote` (`tariffs.ts`) | `GET tariffs/catalogue/<family>/?plan=` |
| Home `(tabs)/index` | IsteSen row ("Renews 25 October, 00:00"), Remaining balance card (7.2 / 20 GB, 30 / 30 min), aggregation sheet | `subscriber` (`mock.ts`) | `GET tariffs/my/usage/` |
| Remaining balance `remaining-balance` | IsteSen, "18 d. 21 h.", three usage rows | `myTariffHeader`, `usage` (`myTariff.ts`) | `GET tariffs/my/usage/` |
| My tariff `my-tariff/index` | header, usage bars, payment details, redesign card, Total price, banner, charging note, Manage sheet, Renew sheet | `myTariffSeed` (`myTariff.ts`) | `GET tariffs/my/` |
| Redesign `my-tariff/redesign` | five sliders, "Save: 19.10 ₼" | `redesignSeed` | `GET/POST tariffs/my/redesign/` |
| Change tariff `my-tariff/change` | DigiMax / Premium+ chips, 5 cards | `changeGroups` | `GET tariffs/change/` |
| Premium `premium` | logo, 8 benefits, note, Continue | `premiumSeed` | `GET tariffs/premium/` |
| Story "Especially for you" page 1 | three tilted tariff cards | `storyTariffs` = `hotTariffs` by id | `GET tariffs/hot/` |
| Home banners | "Choose Premium+ …" → `/tariffs/premium-plus`, "DigiMax. With your rhythm!" → `/tariffs/digimax` | `homeBanners` | `GET content/home/` |

## 2. Mobile models (TypeScript)

### 2.1 Catalogue — `src/data/tariffs.ts`, `src/data/mock.ts`

```ts
export type Social = 'whatsapp' | 'telegram' | 'instagram' | 'facebook' | 'tiktok';

export type FeatureKind = 'internet' | 'calls' | 'sms' | 'social' | 'app' | 'roaming' | 'validity';
export type TariffFeature = { kind: FeatureKind; label: string; value: string; socials?: Social[] };
export type TariffPlan = { id: string; title: string; price: number; hot?: boolean; features: TariffFeature[] };
export type TariffFamily = {
  id: string;
  name: string;
  subtitle?: string;
  badges: string[];          // 'PREPAID' | 'PREMIUM' — PREMIUM renders cream (#F2E7D8 / #6B4B2A), others blue (#4D63E6)
  premium?: boolean;
  defaultPlanId: string;     // selected when the page opens without a valid ?plan=
  plans: TariffPlan[];
};

export type TotalPriceGroup = { heading: string; tone: 'secondary' | 'red'; rows: { label: string; value: number }[] };
export type TariffPage = { family: TariffFamily; totalPrice: TotalPriceGroup[]; note: string; cta?: string };

// Products tab card and story card
export type TariffOffer = {
  id: string;
  name: string;
  period: string;            // '28 days' | '' (Premium shows tagline instead)
  tagline?: string;
  price: number;
  socials: Social[];
  features: { kind: 'data' | 'minutes' | 'sms' | 'roaming'; label: string }[];
};
export type HotTariff = Omit<TariffOffer, 'period'> & { period?: string; familyId: string };

export type PremiumBenefit = { key: string; text: string };
export type PremiumPage = { benefits: PremiumBenefit[]; note: string };
```

### 2.2 Subscriber's tariff — `src/data/myTariff.ts`

```ts
export type UsageKind = 'internet' | 'messaging' | 'calls';
export type Usage = { kind: UsageKind; label: string; remaining: string; remainingUnit: string; total: string; totalUnit: string; ratio: number };

export type MyTariff = {
  title: string;
  lines: { label: string; value: string }[];
  pills: string[];
  usage: Usage[];
  paymentDetails: { label: string; value: string }[];
  totalPriceGroups: TotalPriceGroup[];
  chargingNote: string;
  renew: { title: string; body: string };
  bannerLink: string | null;   // null shows the prototype toast
  bannerAlt: string;
};

export type SliderKey = 'internet' | 'calls' | 'instagramFb' | 'youtube' | 'tiktok';
export type RedesignSlider = { key: SliderKey; label: string; min: number; max: number; step: number; initial: number };
export type Redesign = { sliders: RedesignSlider[]; pricing: { base: number; perGb: number; perMinute: number }; estimate: number };

export type ChangeFeatureKind = 'data' | 'minutes' | 'sms' | 'roaming';
export type ChangeTariff = {
  id: string;
  name: string;
  price: string;             // shown as-is, ranges included: '12-30'
  period?: string;
  tagline?: string;
  isNew?: boolean;
  socials: Social[];
  features: { kind: ChangeFeatureKind; label: string }[];
  familyId?: string;         // opens /tariffs/[familyId]; absent → prototype toast
};
export type ChangeGroup = { key: string; label: string; tariffs: ChangeTariff[] };
```

### 2.3 Wire shapes the app expects — `src/api/tariffs.ts`

```ts
export type ApiFamily = {
  id: string; name: string; subtitle: string | null; badges: string[]; is_premium: boolean;
  plans: { id: string; title: string; price: string; hot: boolean;
           features: { kind: FeatureKind; label: string; value: string; socials?: string[] }[] }[];
  selected_plan: string;
  total_price: { heading: string; tone: 'secondary' | 'red'; rows: { label: string; price: string }[] }[];
  note: string; cta: string;
};
export type ApiHotTariff = { id: string; family_id: string; title: string; price: string; socials: string[];
                             features: { kind: 'data' | 'minutes' | 'sms' | 'roaming'; value: string }[] };
export type ApiMyTariff = { family: string; title: string; pills: string[]; lines: { label: string; value: string }[];
  usage: UsageRow[]; payment_details: { label: string; value: string }[]; total_price: ApiPriceGroup[];
  charging_note: string; banner: { image: string; alt: string; deep_link: string | null }; renew: { title: string; body: string } };
export type MyUsage = { tariff: string; renewal_label: string; period_left: { days: number; hours: number };
  remaining: { data_gb: string; data_total_gb: string; minutes: number; minutes_total: number };
  rows: UsageRow[]; aggregation: { title: string; body: string }[] };
export type ApiRedesign = { estimate: string; pricing: { base: string; per_gb: string; per_minute: string };
  sliders: { key: SliderKey; label: string; min: number; max: number; step: number; value: number }[] };
export type ApiChangeGroup = { id: string; title: string; cards: { id: string; family_id: string | null; title: string;
  tagline: string | null; price: string; period: string | null; is_new: boolean; socials: string[];
  features: { kind: ChangeFeatureKind; value: string }[] }[] };
export type ApiPremium = { benefits: PremiumBenefit[]; logo: string; note: string };
```

Adapter rules in `toHotTariffs` / `toChangeGroups` / `toTariffPage`:

- the hot card's `period` and `tagline` are **not** sent by the API; the
  app takes them from `hotTariffSeed` by `id`,
- socials outside the five the app can draw (e.g. `youtube`) are dropped,
- payment-detail values that are Baku timestamps (`…+04:00`) are shown as
  `25.10.2026, 08:00`; bare money strings get the `₼` sign,
- `defaultPlanId` on the page is the server's `selected_plan`.

## 3. Backend models (Django, `backend-intro/api/tariffs/models.py`)

All catalogue models extend `CatalogueItem` (`order`, `is_active`,
ordering `["order", "id"]`) and use `ActiveQuerySet` (`.active()`).

```python
class SubscriberTariff(models.Model):
    subscriber = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="tariff")
    family = models.CharField(max_length=40, default="istesen")
    title = models.CharField(max_length=60, default="IsteSen")
    price = models.DecimalField(max_digits=8, decimal_places=2, default=Decimal("19.10"))
    validity_days = models.PositiveSmallIntegerField(default=30)
    activated_at = models.DateTimeField()
    last_payment_at = models.DateTimeField()
    next_payment_at = models.DateTimeField()
    data_remaining_gb = models.DecimalField(max_digits=6, decimal_places=2, default=Decimal("7.20"))
    data_total_gb = models.PositiveSmallIntegerField(default=16)
    messaging_remaining_mb = models.PositiveIntegerField(default=1003)
    messaging_total_gb = models.PositiveSmallIntegerField(default=1)
    minutes_remaining = models.PositiveIntegerField(default=30)
    minutes_total = models.PositiveIntegerField(default=30)
    redesign = models.JSONField(default=default_redesign)   # {"internet": 16, "calls": 30, "instagramFb": 0, "youtube": 0, "tiktok": 0}

class TariffFamily(CatalogueItem):
    slug = models.SlugField(max_length=40, unique=True)
    name = models.CharField(max_length=60)
    subtitle = models.CharField(max_length=160, blank=True)
    badges = models.JSONField(default=list, blank=True)      # ["PREPAID"]
    is_premium = models.BooleanField(default=False)

class TariffPlan(CatalogueItem):
    family = models.ForeignKey(TariffFamily, on_delete=models.CASCADE, related_name="plans")
    slug = models.SlugField(max_length=40, unique=True)
    title = models.CharField(max_length=60)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    hot = models.BooleanField(default=False)
    is_default = models.BooleanField(default=False)          # selected when no ?plan=
    features = models.JSONField(default=list)                # [{"kind","label","value","socials"?}]
    hot_position = models.PositiveSmallIntegerField(null=True, blank=True)   # shelf order on Products; null = not on shelf
    hot_socials = models.JSONField(default=list, blank=True)
    hot_features = models.JSONField(default=list, blank=True) # [{"kind","value"}]

class PriceGroup(CatalogueItem):                             # one block of the "Total price" table
    heading = models.CharField(max_length=120)
    tone = models.CharField(max_length=12, choices=[("secondary", …), ("red", …)], default="secondary")
    rows = models.JSONField(default=list)                    # [{"label","price"}]

class ChangeGroup(CatalogueItem):
    slug = models.SlugField(max_length=40, unique=True)
    title = models.CharField(max_length=60)

class ChangeCard(CatalogueItem):
    group = models.ForeignKey(ChangeGroup, on_delete=models.CASCADE, related_name="cards")
    slug = models.SlugField(max_length=40, unique=True)
    title = models.CharField(max_length=60)
    price = models.CharField(max_length=20)                  # "12-30"
    period = models.CharField(max_length=40)
    tagline = models.CharField(max_length=160)
    is_new = models.BooleanField(default=False)
    socials = models.JSONField(default=list, blank=True)
    features = models.JSONField(default=list)                # [{"kind","value"}]
    family = models.ForeignKey(TariffFamily, on_delete=models.SET_NULL, null=True, blank=True, related_name="change_cards")

class PremiumBenefit(CatalogueItem):
    key = models.SlugField(max_length=40, unique=True)
    text = models.CharField(max_length=160)

class RedesignSlider(CatalogueItem):
    key = models.CharField(max_length=20, unique=True)
    label = models.CharField(max_length=60)
    minimum = models.PositiveSmallIntegerField()
    maximum = models.PositiveSmallIntegerField()
    step = models.PositiveSmallIntegerField(default=1)
```

Translated fields (`django-modeltranslation`, az / ru / en):
`TariffFamily.name, subtitle` · `TariffPlan.title, features, hot_features` ·
`PriceGroup.heading, rows` · `ChangeGroup.title` ·
`ChangeCard.title, period, tagline, features` · `PremiumBenefit.text` ·
`RedesignSlider.label`.

Fixed copy in `api/tariffs/texts.py`: `NOTE`, `CHARGING_NOTE`,
`BANNER_ALT`, `PREMIUM_NOTE`, `AGGREGATION`, `RENEW`. Pricing constants in
`api/tariffs/services.py`: `REDESIGN_PRICING = {base 19.10, per_gb 0.50,
per_minute 0.02}`, `REDESIGN_INCLUDED = {internet 16, calls 30}`.

Mapping mobile → backend:

| Mobile | Backend |
|---|---|
| `TariffFamily` | `TariffFamily` (`id`→`slug`, `premium`→`is_premium`, `defaultPlanId`→`TariffPlan.is_default`) |
| `TariffPlan` | `TariffPlan` (`id`→`slug`, `price` number→Decimal) |
| `hotTariffs[i]` | the same `TariffPlan` row with `hot_position=i+1`, `hot_socials`, `hot_features` |
| `totalPriceGroups` | `PriceGroup` × 2 (`value` number→`price` string) |
| `tariffNote`, `chargingNote`, `renewCopy`, aggregation copy, `premiumNote` | `texts.py` |
| `myTariffHeader`, `usage`, `paymentDetails` | `SubscriberTariff` (computed by `views.my` / `views.usage`) |
| `redesignSliders`, `redesignPricing` | `RedesignSlider` + `services.REDESIGN_*` |
| `changeGroups` | `ChangeGroup` + `ChangeCard` |
| `premiumBenefits` | `PremiumBenefit` |

## 4. Catalogue data (mobile values)

### 4.1 Families

| `id` | `name` | `subtitle` | `badges` | `premium` | `defaultPlanId` |
|---|---|---|---|---|---|
| `digimax` | DigiMax | — | `PREPAID` | no | `digimax-10` |
| `premium-plus` | Premium+ | Choose excellence! | `PREPAID`, `PREMIUM` | yes | `premium-60` |

### 4.2 Plans and features

`allSocials` = whatsapp, telegram, instagram, facebook, tiktok. Feature
rows render in this order with the icon of their `kind`; `social` and
`app` rows also draw the `socials` cluster; the info icon shows only on
"Local calls" and "Local SMS".

**DigiMax 5GB** — `digimax-5`, 12 ₼, hot: no

| kind | label | value | socials |
|---|---|---|---|
| internet | Internet | 5 GB | |
| calls | Local calls | 300 min | |
| sms | Local SMS | 150 SMS | |
| social | Messaging | 1 GB | whatsapp |
| validity | Validity period | 28 d. | |

**DigiMax 10GB** — `digimax-10`, 18 ₼, hot: **yes**, family default

| kind | label | value | socials |
|---|---|---|---|
| internet | Internet | 10 GB | |
| calls | Local calls | 600 min | |
| sms | Local SMS | 300 SMS | |
| social | Social media | 1 GB | whatsapp, telegram, instagram, facebook |
| app | Application traffic | 1 GB | whatsapp |
| validity | Validity period | 28 d. | |

**DigiMax 25GB** — `digimax-25`, 30 ₼, hot: **yes**

| kind | label | value | socials |
|---|---|---|---|
| internet | Internet | 25 GB | |
| calls | Local calls | 1500 min | |
| sms | Local SMS | 500 SMS | |
| social | Social media | 3 GB | allSocials |
| app | Application traffic | 3 GB | whatsapp |
| validity | Validity period | 28 d. | |

**Premium+ 60GB** — `premium-60`, 60 ₼, hot: no, family default

| kind | label | value | socials |
|---|---|---|---|
| internet | Internet | 60 GB | |
| calls | Local calls | 3000 min | |
| sms | Local SMS | 1500 SMS | |
| social | Social media | 5 GB | allSocials |
| app | Application traffic | 5 GB | whatsapp |
| roaming | Roaming | 1 GB | |
| validity | Validity period | 28 d. | |

**Premium+ 100GB** — `premium-100`, 90 ₼, hot: **yes**

| kind | label | value | socials |
|---|---|---|---|
| internet | Internet | 100 GB | |
| calls | Local calls | 5000 min | |
| sms | Local SMS | 2500 SMS | |
| social | Social media | 10 GB | allSocials |
| app | Application traffic | 10 GB | whatsapp |
| roaming | Roaming | 3 GB | |
| validity | Validity period | 28 d. | |

### 4.3 Hot offers (Products tab, story card) — `hotTariffs`, shelf order

| pos | `id` | `name` | `period` | `tagline` | `price` | `socials` | features |
|---|---|---|---|---|---|---|---|
| 1 | `digimax-10` | DigiMax 10GB | 28 days | — | 18 | whatsapp, telegram, instagram, facebook | data `10 GB`, minutes `600 min.`, sms `300 SMS` |
| 2 | `digimax-25` | DigiMax 25GB | 28 days | — | 30 | allSocials | data `25 GB`, minutes `1500 min.`, sms `500 SMS` |
| 3 | `premium-60` | Premium+ 60GB | `''` | Choose excellence! | 60 | allSocials | data `60 GB`, minutes `3000 min.`, sms `1500 SMS`, roaming `1 GB roaming` |

The story "Especially for you" page 1 draws the same cards in the order
`digimax-10`, `premium-60`, `digimax-25` (tilts −1.8° / 1.8° / 0.4°),
title "Hot offers on tariffs", subtitle "Tariff packs that suits you",
CTA "View all tariffs" (`:todo`).

### 4.4 Total price (catalogue pages) — `totalPriceGroups` in `tariffs.ts`

Both groups list the same five rates; group 1 tone `secondary`, group 2
tone `red`.

| group heading | tone |
|---|---|
| When you use all package, prices will be next: | secondary |
| If monthly fee is not paid: | red |

| label | value |
|---|---|
| Internet - 1MB | 0.05 |
| Local calls - 1 MIN. | 0.19 |
| Local SMS - 1 SMS | 0.10 |
| International calls - 1 MIN. | 0.50 |
| International SMS - 1 SMS | 0.25 |

### 4.5 Texts and rendering rules

| Key | Value |
|---|---|
| `tariffNote` | When the subscription fee of the tariff is paid, the line of the number will remain bilaterally active for 28 days. |
| CTA | `Subscribe for <price with 2 decimals> ₼` (e.g. "Subscribe for 18.00 ₼"); the server may send `cta` for the default plan |
| plan chip | title + `<price> ₼`; `hot` plans carry a fire badge |
| "CHOOSE YOUR PLAN" | `PlanChooser` label |
| badge colours | PREMIUM → `#F2E7D8` on `#6B4B2A`; any other → `#4D63E6` on white |
| Premium family page | rose-gold theme (`#121212` cards, `#D9B48F` outline) |

## 5. Subscriber's tariff (IsteSen) — mobile values

### 5.1 Header and Home

| Field | Value |
|---|---|
| title | IsteSen |
| family | `istesen` |
| pills | `CURRENT TARIFF`, `PREPAID` |
| line "Current tariff" | 19.10 ₼/month |
| line "Next renewal" | 19.10 ₼/month |
| Home row | "Renews 25 October, 00:00" |
| Home Remaining balance card | 7.2 / 20 GB, 30 / 30 minutes (`subscriber.remaining` in `mock.ts`; note the My tariff page totals 16 GB) |
| Remaining balance page period | 18 d. 21 h. (seed; server: `period_left`) |

### 5.2 Usage rows — `usage`

| kind | label | remaining | unit | total | unit | ratio |
|---|---|---|---|---|---|---|
| internet | Internet | 7.20 | GB | 16 | GB | 0.45 |
| messaging | Messaging | 1003 | MB | 1 | GB | 0.98 |
| calls | Local calls | 30 | MIN. | 30 | MIN. | 1 |

### 5.3 Payment details — `paymentDetails`

| label | value (mobile) | value (API, Baku time) |
|---|---|---|
| Validity period | 30 d. | `30 d.` |
| Activation date | 24.09.2026, 00:00 | `2026-09-24T00:00:00+04:00` |
| Last payment date | 24.09.2026, 00:00 | `2026-09-24T00:00:00+04:00` |
| Next payment date | 25.10.2026, 08:00 | `2026-10-25T08:00:00+04:00` |
| Payment amount | 19.10 ₼ | `19.10` |

### 5.4 Total price (My tariff page) — `totalPriceGroups` in `myTariff.ts`

Same two headings as 4.4, but **four** rows (no international calls) and
the label "Internet - 1 MB" with a space:

| label | value |
|---|---|
| Internet - 1 MB | 0.05 |
| Local calls - 1 MIN. | 0.19 |
| Local SMS - 1 SMS | 0.10 |
| International SMS - 1 SMS | 0.25 |

### 5.5 Other copy on the page

| Key | Value |
|---|---|
| `chargingNote` | Charging interval: 1 minute for calls |
| banner | "All you need and more!" → `/internet-packs` (`banner-want-more.png`, aspect 512/180) |
| redesign card | "Redesign your tariff" / "Customise & Save it for the next tariff renewal" / "Redesign right now" |
| Manage sheet | "Redesign for next renewal", "Renew tariff", "Change tariff" |
| `renewCopy.title` | Renew tariff |
| `renewCopy.body` | By renewing tariff, the remaining balance will be annulled but the existing old internet packs will still stay active. |
| aggregation "For internet" | The total shows the sum of the internet in your tariff and in all of your active internet packs. (backend `texts.AGGREGATION`) |
| aggregation "For calls" | The total shows the sum of the local minutes in your tariff and in all of your active packs. |
| panel colour | `tariffSurface = #231C2E` |

### 5.6 Redesign — `redesignSliders`, `redesignPricing`

| key | label | min | max | step | initial |
|---|---|---|---|---|---|
| internet | Internet GB | 0 | 16 | 1 | 16 |
| calls | Local calls min. | 30 | 350 | 10 | 30 |
| instagramFb | Instagram & FB GB | 0 | 5 | 1 | 0 |
| youtube | YouTube GB | 0 | 10 | 1 | 0 |
| tiktok | TikTok GB | 0 | 10 | 1 | 0 |

Pricing: `base 19.10`, `perGb 0.50`, `perMinute 0.02`; estimate =
`19.10 + 0.50 × (internet − 16 + instagramFb + youtube + tiktok) + 0.02 × (calls − 30)`;
unchanged sliders → "Save: 19.10 ₼". Backend keeps the same formula
(`services.estimate`) and stores the values in `SubscriberTariff.redesign`.

### 5.7 Change tariff — `changeGroups`

Group `digimax` (label "DigiMax"):

| `id` | `name` | `price` | `period` | `tagline` | `isNew` | `socials` | features | `familyId` |
|---|---|---|---|---|---|---|---|---|
| `digimax` | DigiMax | 12-30 | 28 days | — | — | allSocials | data `5-25 GB`, minutes `300-1500 min.`, sms `150-500 SMS` | `digimax` |
| `digimax-3gb` | DigiMax 3GB | 8 | 14 days | — | — | — | data `3 GB`, minutes `200 min.`, sms `100 SMS` | — (`:todo`) |
| `digimax-weekly` | DigiMax Həftəlik | 4 | 7 days | — | — | — | data `1 GB`, minutes `100 min.`, sms `50 SMS` | — (`:todo`) |
| `digimax-daily` | DigiMax Günlük | 1 | 1 day | — | — | — | data `300 MB`, minutes `30 min.`, sms `15 SMS` | — (`:todo`) |

Group `premium` (label "Premium+"):

| `id` | `name` | `price` | `period` | `tagline` | `isNew` | `socials` | features | `familyId` |
|---|---|---|---|---|---|---|---|---|
| `premium-plus` | Premium+ | 60-90 | — | Choose excellence! | yes | allSocials | data `60-100 GB`, minutes `3000-5000 min.`, sms `1500-2500 SMS`, roaming `1-3 GB roaming` | `premium-plus` |

### 5.8 Premium page — `premiumBenefits`, `premiumNote`

| key | text |
|---|---|
| curator | Personal curator for all your needs |
| priority | Priority when viewing requests and complaints |
| free | Free services: SIM card change, Detailed invoice, Soclir |
| kinon | The 6-month special offer for Kinon Premium subscription |
| pasha | 20% discount on PASHA Insurance (CASCO) |
| ateshgah | 20% discount on Ateshgah Insurance |
| wolt | 6 months of Wolt+ subscription for free |
| theme | Premium Gold theme |

Note: "To access the Premium theme you must log in with Premium number as
main account". Logo `premium-logo.png` (300×80). CTA "Continue" (`:todo`).

### 5.9 Related story items (not tariffs, shown next to them)

"Especially for you" page 2 "Always be online" (internet packs): 3 GB /
28 days / 9.00 · 350 MB / 24 hours / 0.99 · 1 hour / Unlimited Speed /
0.99 · 6 GB / 29 days / 12.00. Page 3 "Stay connected in roaming":
10 GB / 30 days / 75.00 · 5 GB / 30 days / 50.00 · 2 GB / 20 days /
25.00 · 500 MB / 3 days / 10.00 (the Roaming story says 2 GB / 10 days).

## 6. Backend seed vs mobile — differences today

`api/seeding/data/tariffs.py` says in its docstring that abbreviated
entries are placeholders. These rows differ from the app:

| Where | Backend seed | Mobile (correct) |
|---|---|---|
| `TOTAL_PRICE` rows | 4 rows: Local calls 0.06, SMS - 1 pcs. 0.05, International SMS 0.20; red group 0.10 / 0.10 / 0.06 / 0.25 | 5 rows, same in both groups: 0.05 / 0.19 / 0.10 / 0.50 / 0.25 (labels in 4.4) |
| `digimax-5` features | 100 min., 50 SMS, no social | 300 min, 150 SMS, Messaging 1 GB (whatsapp) |
| `digimax-10` features | 200 min., 100 SMS, "Social networks Unlimited" (whatsapp, telegram) | 600 min, 300 SMS, Social media 1 GB (4 socials), Application traffic 1 GB (whatsapp) |
| `digimax-25` features | 500 min., 200 SMS, social 3 networks | 1500 min, 500 SMS, Social media 3 GB (5), Application traffic 3 GB |
| `premium-plus` family | subtitle "For those who expect more", badges `POSTPAID` | subtitle "Choose excellence!", badges `PREPAID`, `PREMIUM` |
| `premium-60` | hot True; Unlimited min, 500 SMS, socials incl. youtube | hot **false**; 3000 min, 1500 SMS, Social media 5 GB (5), Application traffic 5 GB, Roaming 1 GB |
| `premium-100` | hot False; Unlimited / Unlimited | hot **true**; 5000 min, 2500 SMS, Social media 10 GB, Application traffic 10 GB, Roaming 3 GB |
| feature labels | "SMS", "Social networks", "Roaming internet" | "Local SMS", "Social media" / "Messaging", "Application traffic", "Roaming" |
| `HOT` socials / features | 2–4 socials, "200 min." etc. | see 4.3 |
| `CHANGE_GROUPS` | DigiMax: 2 cards (3GB is 9 ₼ / 28 days / NEW); Premium group titled "Premium" with an extra "Premium 45 ₼" card; taglines invented | DigiMax: 4 cards (12-30, 3GB 8 ₼ / 14 days, Həftəlik 4 ₼ / 7 days, Günlük 1 ₼ / 1 day); group "Premium+" with one card (NEW) |
| `PREMIUM.benefits` | priority / theme / roaming / lounge / partners / number / events | see 5.8 |
| `SubscriberTariff` | matches (19.10, 7.20 / 16, 1003 / 1, 30 / 30, 24 Sep → 25 Oct 08:00) | — |
| `REDESIGN_SLIDERS`, pricing | match | — |
| My-tariff Total price | served from the same `PriceGroup` rows as the catalogue | app seed shows 4 rows with "Internet - 1 MB"; one table for both is acceptable, the catalogue's 5 rows win |

Two small backend shape issues the app tolerates:

- `ChangeCard.period` / `tagline` are required `CharField`s; cards
  without them must be seeded as `""`, and `catalogue.change_groups()`
  should return `card.period or None` so the app's `period ?? undefined`
  hides the line.
- the `cta` of a family page is only sent for the selected plan; the app
  composes the others itself.

## 7. Replacement seed — `api/seeding/data/tariffs.py` (mobile values)

Drop-in for the backend's current file; same constant names and shapes
the loader in `api/seeding/catalogue.py` expects (`FAMILIES` dict with
`default_plan`, `HOT` list in shelf order, `TOTAL_PRICE`,
`CHANGE_GROUPS`, `PREMIUM`, `REDESIGN_SLIDERS`).

```python
"""Tariff catalogue content — the mobile app's values, verbatim.

Sources: src/data/tariffs.ts, src/data/myTariff.ts, hotTariffs in src/data/mock.ts.
"""

ALL_SOCIALS = ["whatsapp", "telegram", "instagram", "facebook", "tiktok"]

_OVERAGE = [
    {"label": "Internet - 1MB", "price": "0.05"},
    {"label": "Local calls - 1 MIN.", "price": "0.19"},
    {"label": "Local SMS - 1 SMS", "price": "0.10"},
    {"label": "International calls - 1 MIN.", "price": "0.50"},
    {"label": "International SMS - 1 SMS", "price": "0.25"},
]

TOTAL_PRICE = [
    {"heading": "When you use all package, prices will be next:", "tone": "secondary", "rows": _OVERAGE},
    {"heading": "If monthly fee is not paid:", "tone": "red", "rows": _OVERAGE},
]


def _f(kind, label, value, socials=None):
    feature = {"kind": kind, "label": label, "value": value}
    if socials:
        feature["socials"] = socials
    return feature


FAMILIES = {
    "digimax": {
        "id": "digimax",
        "name": "DigiMax",
        "subtitle": None,
        "badges": ["PREPAID"],
        "is_premium": False,
        "default_plan": "digimax-10",
        "plans": [
            {
                "id": "digimax-5",
                "title": "DigiMax 5GB",
                "price": "12.00",
                "hot": False,
                "features": [
                    _f("internet", "Internet", "5 GB"),
                    _f("calls", "Local calls", "300 min"),
                    _f("sms", "Local SMS", "150 SMS"),
                    _f("social", "Messaging", "1 GB", ["whatsapp"]),
                    _f("validity", "Validity period", "28 d."),
                ],
            },
            {
                "id": "digimax-10",
                "title": "DigiMax 10GB",
                "price": "18.00",
                "hot": True,
                "features": [
                    _f("internet", "Internet", "10 GB"),
                    _f("calls", "Local calls", "600 min"),
                    _f("sms", "Local SMS", "300 SMS"),
                    _f("social", "Social media", "1 GB", ["whatsapp", "telegram", "instagram", "facebook"]),
                    _f("app", "Application traffic", "1 GB", ["whatsapp"]),
                    _f("validity", "Validity period", "28 d."),
                ],
            },
            {
                "id": "digimax-25",
                "title": "DigiMax 25GB",
                "price": "30.00",
                "hot": True,
                "features": [
                    _f("internet", "Internet", "25 GB"),
                    _f("calls", "Local calls", "1500 min"),
                    _f("sms", "Local SMS", "500 SMS"),
                    _f("social", "Social media", "3 GB", ALL_SOCIALS),
                    _f("app", "Application traffic", "3 GB", ["whatsapp"]),
                    _f("validity", "Validity period", "28 d."),
                ],
            },
        ],
    },
    "premium-plus": {
        "id": "premium-plus",
        "name": "Premium+",
        "subtitle": "Choose excellence!",
        "badges": ["PREPAID", "PREMIUM"],
        "is_premium": True,
        "default_plan": "premium-60",
        "plans": [
            {
                "id": "premium-60",
                "title": "Premium+ 60GB",
                "price": "60.00",
                "hot": False,
                "features": [
                    _f("internet", "Internet", "60 GB"),
                    _f("calls", "Local calls", "3000 min"),
                    _f("sms", "Local SMS", "1500 SMS"),
                    _f("social", "Social media", "5 GB", ALL_SOCIALS),
                    _f("app", "Application traffic", "5 GB", ["whatsapp"]),
                    _f("roaming", "Roaming", "1 GB"),
                    _f("validity", "Validity period", "28 d."),
                ],
            },
            {
                "id": "premium-100",
                "title": "Premium+ 100GB",
                "price": "90.00",
                "hot": True,
                "features": [
                    _f("internet", "Internet", "100 GB"),
                    _f("calls", "Local calls", "5000 min"),
                    _f("sms", "Local SMS", "2500 SMS"),
                    _f("social", "Social media", "10 GB", ALL_SOCIALS),
                    _f("app", "Application traffic", "10 GB", ["whatsapp"]),
                    _f("roaming", "Roaming", "3 GB"),
                    _f("validity", "Validity period", "28 d."),
                ],
            },
        ],
    },
}

# Products "Hot offers on tariffs", shelf order. The app adds period/tagline itself.
HOT = [
    {
        "id": "digimax-10",
        "family_id": "digimax",
        "title": "DigiMax 10GB",
        "price": "18.00",
        "socials": ["whatsapp", "telegram", "instagram", "facebook"],
        "features": [
            {"kind": "data", "value": "10 GB"},
            {"kind": "minutes", "value": "600 min."},
            {"kind": "sms", "value": "300 SMS"},
        ],
    },
    {
        "id": "digimax-25",
        "family_id": "digimax",
        "title": "DigiMax 25GB",
        "price": "30.00",
        "socials": ALL_SOCIALS,
        "features": [
            {"kind": "data", "value": "25 GB"},
            {"kind": "minutes", "value": "1500 min."},
            {"kind": "sms", "value": "500 SMS"},
        ],
    },
    {
        "id": "premium-60",
        "family_id": "premium-plus",
        "title": "Premium+ 60GB",
        "price": "60.00",
        "socials": ALL_SOCIALS,
        "features": [
            {"kind": "data", "value": "60 GB"},
            {"kind": "minutes", "value": "3000 min."},
            {"kind": "sms", "value": "1500 SMS"},
            {"kind": "roaming", "value": "1 GB roaming"},
        ],
    },
]

CHANGE_GROUPS = [
    {
        "id": "digimax",
        "title": "DigiMax",
        "cards": [
            {
                "id": "digimax",
                "title": "DigiMax",
                "price": "12-30",
                "period": "28 days",
                "tagline": "",
                "is_new": False,
                "socials": ALL_SOCIALS,
                "features": [
                    {"kind": "data", "value": "5-25 GB"},
                    {"kind": "minutes", "value": "300-1500 min."},
                    {"kind": "sms", "value": "150-500 SMS"},
                ],
                "family_id": "digimax",
            },
            {
                "id": "digimax-3gb",
                "title": "DigiMax 3GB",
                "price": "8",
                "period": "14 days",
                "tagline": "",
                "is_new": False,
                "socials": [],
                "features": [
                    {"kind": "data", "value": "3 GB"},
                    {"kind": "minutes", "value": "200 min."},
                    {"kind": "sms", "value": "100 SMS"},
                ],
                "family_id": None,
            },
            {
                "id": "digimax-weekly",
                "title": "DigiMax Həftəlik",
                "price": "4",
                "period": "7 days",
                "tagline": "",
                "is_new": False,
                "socials": [],
                "features": [
                    {"kind": "data", "value": "1 GB"},
                    {"kind": "minutes", "value": "100 min."},
                    {"kind": "sms", "value": "50 SMS"},
                ],
                "family_id": None,
            },
            {
                "id": "digimax-daily",
                "title": "DigiMax Günlük",
                "price": "1",
                "period": "1 day",
                "tagline": "",
                "is_new": False,
                "socials": [],
                "features": [
                    {"kind": "data", "value": "300 MB"},
                    {"kind": "minutes", "value": "30 min."},
                    {"kind": "sms", "value": "15 SMS"},
                ],
                "family_id": None,
            },
        ],
    },
    {
        "id": "premium",
        "title": "Premium+",
        "cards": [
            {
                "id": "premium-plus",
                "title": "Premium+",
                "price": "60-90",
                "period": "",
                "tagline": "Choose excellence!",
                "is_new": True,
                "socials": ALL_SOCIALS,
                "features": [
                    {"kind": "data", "value": "60-100 GB"},
                    {"kind": "minutes", "value": "3000-5000 min."},
                    {"kind": "sms", "value": "1500-2500 SMS"},
                    {"kind": "roaming", "value": "1-3 GB roaming"},
                ],
                "family_id": "premium-plus",
            },
        ],
    },
]

PREMIUM = {
    "logo": "premium-logo.png",
    "benefits": [
        {"key": "curator", "text": "Personal curator for all your needs"},
        {"key": "priority", "text": "Priority when viewing requests and complaints"},
        {"key": "free", "text": "Free services: SIM card change, Detailed invoice, Soclir"},
        {"key": "kinon", "text": "The 6-month special offer for Kinon Premium subscription"},
        {"key": "pasha", "text": "20% discount on PASHA Insurance (CASCO)"},
        {"key": "ateshgah", "text": "20% discount on Ateshgah Insurance"},
        {"key": "wolt", "text": "6 months of Wolt+ subscription for free"},
        {"key": "theme", "text": "Premium Gold theme"},
    ],
    "note": "To access the Premium theme you must log in with Premium number as main account",
}

REDESIGN_SLIDERS = [
    {"key": "internet", "label": "Internet GB", "min": 0, "max": 16, "step": 1},
    {"key": "calls", "label": "Local calls min.", "min": 30, "max": 350, "step": 10},
    {"key": "instagramFb", "label": "Instagram & FB GB", "min": 0, "max": 5, "step": 1},
    {"key": "youtube", "label": "YouTube GB", "min": 0, "max": 10, "step": 1},
    {"key": "tiktok", "label": "TikTok GB", "min": 0, "max": 10, "step": 1},
]
```

After replacing the file: `uv run python manage.py seed` (the loader
upserts by slug / key, so existing rows are updated in place), then
`GET /api/tariffs/catalogue/digimax/` should return the five features of
section 4.2 and `GET /api/tariffs/hot/` the three cards of 4.3.
