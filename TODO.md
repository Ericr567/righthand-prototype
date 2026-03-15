# Project TODOs and Feature Gaps

## Recent Completed Work (2026-03-15)

- Added persistent app state hydration/saving via AsyncStorage for bills, transactions, auto-save config, and theme mode.
- Implemented global light/dark theme support with runtime toggle in Settings and applied theme tokens across core screens.
- Fixed dark mode background rendering on Bills and Calendar screens.
- Added Plaid serverless integration for link-token creation, institution search, and public-token exchange.
- Reworked Bank connection flow to searchable dropdown with institution login-page links.
- Added accessibility improvements including progress semantics and richer labels/hints on key bill details interactions.
- Added dashboard enhancements: certainty score, miss-risk alerts, and paycheck allocation preview.

## UI/Navigation placeholders

- Dashboard:
  - real list of bills from state or backend
  - "Next Savings Pull" and "Next Bill Payment" should compute actual values
- Settings:
  - Profile
  - Bank Accounts
  - Security & Password
  - Legal & Privacy
- AddBill/AddPaycheck:
  - validation feedback
  - confirm success message
- BankConnect:
  - evaluate mobile-native Plaid Link support path (web flow is complete)
- Notifications:
  - persistent notifications storage
- Help:
  - load FAQs from backend

## General TODOs

- Add unit/component tests
- Expand accessibility audit and fix remaining edge cases
- Add analytics / crash reporting
- Build API service layer and secure storage

This list is a living document—add items as new gaps are identified.