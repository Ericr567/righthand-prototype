RightHand — Website Prototype (Expo + React Native Web)

Quick start

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

Notes

- The project includes separated screen files in `screens/` and a small `components/ProgressBar.js`.
- Navigation is wired using React Navigation (`@react-navigation/native`, stack and bottom tabs).

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

If you want, I can run `npm install` here and verify Metro starts — say "install and run" and I'll attempt that in the terminal.
