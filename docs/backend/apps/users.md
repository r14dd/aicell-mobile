# apps.users

Subscriber identity, OTP login, JWT issuing, request logging.

## Structure

| Path | Contents |
|---|---|
| `models/subscriber.py` | `Subscriber` (`AUTH_USER_MODEL`), manager creating from MSISDN |
| `models/otp.py` | `OtpRequest` audit |
| `models/device.py` | `Device` `:todo` |
| `models/request_log.py` | `RequestLog` |
| `authentication.py` | `StaticTokenAuthentication` (copied from aikhan-internal) |
| `permissions.py` | `IsSubscriber`, `IsOwner`, `IsServiceAPIKey`, `IsPremium` `:todo` |
| `services/otp.py` | `send_otp(msisdn)`, `verify_otp(request_id, code)` — Redis-backed |
| `services/tokens.py` | `issue_tokens(subscriber)`, `blacklist(refresh)` |
| `utils/msisdn.py` | `normalise("051 664 33 42") -> "994516643342"`, `display("994516643342") -> "051 664 33 42"` |
| `middleware.py` | `RequestLogMiddleware` |
| `views.py` | `OtpSendView`, `OtpVerifyView`, `LogoutView`, `MeView`, `AppSettingsView` `:todo`, `DeviceView` `:todo` |
| `tasks.py` | `send_otp_sms` (Celery; logs the code in DEBUG) |

## Business rules

- A subscriber is identified by MSISDN only; there is no password.
- `MeView` returns what Home and More render: display name, display
  MSISDN, line type, language, app version string.
- Profile edit (`PATCH me/`) is `:todo` — the More tab profile card
  shows a prototype notice.
- App settings (`GET/PATCH me/app-settings/`) is `:todo` — the "App
  settings" row shows a prototype notice. Reserved shape:
  `{ "theme": "dark|light|system", "language": "en|az|ru", "push": true }`.
  Dark Mode is advertised in a story, so `theme` is reserved now.

## Seed

| Field | Value |
|---|---|
| `msisdn` | `994516643342` (displayed `051 664 33 42`) |
| `display_name` | `Qüdrət Abidzadə` |
| `line_type` | `prepaid` |
| `language` | `en` |

## `:todo`

- OTP login screens (no mobile screen yet).
- Logout (More → "Sign out").
- Device / push token registration.
- Profile settings, app settings.
