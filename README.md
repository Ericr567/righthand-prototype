RightHand — Website Prototype (Expo + React Native Web)

## Quick start

1. Install dependencies:

```bash
cd righthand-prototype
npm install
```

2. Start website dev server:

```bash
npm start
```

3. Open the local URL shown in terminal (usually `http://localhost:19006`).

Build static website output:

```bash
npm run build:web
```

---

## Changelog

### 2026-03-14 — Full UI/UX overhaul + new screens

#### New screens
- **ProfileScreen** — avatar with dynamic initials, inline edit for name/email/phone, account info card (member since, plan, status pill), danger zone delete action
- **SecurityScreen** — change password with live strength meter (Weak/Fair/Strong), show/hide toggle, Two-Factor Authentication + Biometric Login switches, active sessions card with "Current" pill and sign-out-all link
- **AutoSaveScreen** — enable/disable toggle, Fixed/Percent segment switcher, frequency pill selector, next pay date field

#### New components
- **BrandLogo** — renders the righthand logo asset with configurable size
- **ProgressBar** — brand-colored track/fill bar (cream track, forest green fill)

#### Screen redesigns
- **DashboardScreen** — forest green hero savings card, stats row, upcoming bills with urgency tinting + countdown badges, Auto Save section
- **AutoPayScreen** — summary strip, rich bill cards with ProgressBar + savings %, Switch toggles, urgency badges, dashed add button
- **BillDetailsScreen** — hero card with bill name/amount/auto-pay pill, 3-stat row, log-transfer form, dot-timeline transfer history, Edit/Delete action row
- **CalendarScreen** — pill segment switcher (Calendar/List), date chip grid, 3-stat detail card, list view with date badge squares
- **SavingsBreakdownScreen** — hero card with total saved + progress %, per-bill cards, timeline transaction history
- **NotificationsScreen** — unread count badge, Switch toggles, colour-coded notification cards, mark-all-read, empty state
- **SettingsScreen** — grouped section cards; all rows navigate to correct routes including Profile and Security
- **HelpScreen** — accordion FAQ, border highlights primary green when open, dark green CTA card
- **AddBillScreen** — grouped form cards, pill chip selectors for due date and frequency, $ prefix amount field
- **AddPaycheckScreen** — pill chip frequency selector, optional amount with $ prefix
- **BankConnectScreen** — full-bleed forest green hero with trust badges, elevated search bar, bank cards with colour-tinted logo bubbles + checkmark selection, animated connecting state, full-screen success overlay
- **SignupScreen** — polished form with brand styling
- **WelcomeScreen** — hero intro with brand identity

#### App.js
- All new screens imported and registered as stack routes (Profile, Security, AutoSave)
- `enrichedBills` and `savedByBill` derived via `useMemo` from transactions
- `addBill`, `updateBill`, `deleteBill`, `toggleBillAutoPay`, `addTransaction`, `updateAutoSave` handlers

#### styles/common.js
- Extended palette: `subtleBg`, `dangerBg`, `dangerBorder`, `dangerText`, `successBg`, `successBorder`, `successText`
- Brand colors: Forest Green `#0B4226`, Cream `#F5EEE3`, Deep Brown `#5C3A21`, Moss Green `#9BB38C`, Slate Gray `#36454F`

---

## Notes

- Screens are in `screens/`, shared components in `components/`, brand styles in `styles/common.js`.
- Navigation: React Navigation (`@react-navigation/native`) with stack + bottom tabs.
- Icons are emoji-based — no external icon library required.
- Local build/cache artifacts are ignored by git (`.expo/`, `node_modules/.cache/`, `.DS_Store`).

## Features

- Onboarding flow (welcome signup, bank connection)
- Dashboard with savings and bill overview
- Add / edit / delete bills with progress indicator
- Savings breakdown, calendar, auto-pay and notifications screens
- Basic settings with navigation to support and notifications

## Next Steps

- Add persistence (AsyncStorage or a backend API)
- Implement real authentication/authorization
- Flesh out profile, security, and legal screens
- Add tests and improve styling for production readiness

## Custom Logo

Set your app logo in `assets/branding.js`.

- Local logo file:
	- Add your image to `assets/` (example: `assets/my-logo.png`).
	- Set `logoSource` to `require('./my-logo.png')`.
- Hosted logo URL:
	- Set `logoUri` to the full URL.

If both `logoSource` and `logoUri` are empty, the default built-in RightHand mark is shown.

If you want, I can run `npm install` here and verify Metro starts — say "install and run" and I'll attempt that in the terminal.
