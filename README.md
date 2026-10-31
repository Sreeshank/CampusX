# CampusX starter

**Connect. Share. Ride.** A beginner-friendly browser-app starting point for a three-person team at KITS Warangal.

[Open the live CampusX demo](https://sreeshank.github.io/CampusX/)

Hosted free on GitHub Pages. Demo data stays in your browser; live Firebase integration is pending.

## Start in five minutes

Install Node.js **22.18+** (Node 24 LTS is also suitable for frontend development) and Git. Then run in the VS Code terminal:

```bash
git clone https://github.com/Sreeshank/CampusX.git
cd CampusX
npm ci
npm run dev
```

Open the local URL printed by Vite. No API keys, Firebase account, or `.env` file are required for the local demo. The first dependency installation needs internet access. Both frontend and Functions lockfiles are included; use `npm ci` for reproducible installs.

If using the downloaded ZIP, extract it, open the `campusx-starter` folder in VS Code, and run the last two commands there. Do not open `index.html` directly; Vite compiles the app.

## What you can try

- Home dashboard and mobile/desktop navigation.
- XChange: title-prefix search, category/mode filters, create/edit listing, optional compressed photo, sale/swap/donation, saved items, reserve/complete/withdraw.
- XRide: offer/search rides, request one seat, accept/reject as driver, cancel requests/offers, view history.
- Private-looking demo inbox, messages, blocking and in-app activity notices.
- Editable demo profiles, pending-member gate, admin approval, listing reports and removal with an audit log.

Use **Try as** in the top bar to switch between Aarav, Sneha, New Student and Campus Admin. Start as Aarav, message Sneha about her textbook, switch to Sneha and reply. Request her ride as Aarav, accept as Sneha, then cancel as Aarav.

**This is a local development demo.** Data is in localStorage and visible in browser tools. Account switching is not real authentication; it is a way to demonstrate the flows. Data is not shared between devices or synchronized between tabs. Use one tab and switch accounts. Do not put real student information into it.

## Who builds what

| Person        | Work package                                                                  | Main folders                                                                                      |
| ------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| 1 — Sreeshank | [Home, shared UI and XChange](https://github.com/Sreeshank/CampusX/issues/1)  | `src/app`, `src/components`, `src/features/home`, `src/features/xchange`, `functions/src/xchange` |
| 2             | [Accounts, platform and admin](https://github.com/Sreeshank/CampusX/issues/2) | `src/features/auth`, `profile`, `messages`, `admin`, `src/lib/firebase`, `functions/src/platform` |
| 3             | [XRide and integration](https://github.com/Sreeshank/CampusX/issues/3)        | `src/features/xride`, `functions/src/xride`, ride tests                                           |

Person 2 supplies shared security/service patterns. Persons 1 and 3 implement their own backend business functions and wire their own screens. Person 2/3 GitHub assignees are pending usernames.

## Read these next

- [Contribution and fork workflow](CONTRIBUTING.md)
- [Exact starter status and limitations](docs/STARTER_STATUS.md)
- [Firebase handoff](docs/FIREBASE_HANDOFF.md)
- [Person 1 guide](docs/specs/people/PERSON_1.md)
- [Person 2 guide](docs/specs/people/PERSON_2.md)
- [Person 3 guide](docs/specs/people/PERSON_3.md)
- [All 25 feature specifications](docs/specs/FEATURE_INDEX.md)
- [API contract](docs/specs/shared/04_API_CONTRACT.md)
- [Testing and permission plan](docs/specs/shared/05_SECURITY_AND_TESTS.md)

## Commands

```bash
npm run dev          # browser app
npm run build        # TypeScript check and production bundle
npm test             # validation and demo engine tests
npm run test:domain  # dependency-free seat transition tests; Node 22.18+
npx playwright install chromium
npm run test:e2e     # browser workflow tests
npm --prefix functions ci
npm run functions:build
```

## Firebase is a handoff, not a completed backend

`.env.example`, `src/lib/firebase/`, Firebase config, deny-all rules and per-person Cloud Functions folders are included. All server functions currently throw a clear `failed-precondition` error. No fake success response or permissive rule is provided. Setting `VITE_DATA_MODE=firebase` shows an integration-required screen; it does not switch to a working live backend.

The local demo adapter uses some convenient synchronous methods; it is not a drop-in implementation of every callable. Person 2 must build an asynchronous service layer and account provider. See the method mapping in `docs/FIREBASE_HANDOFF.md`.

Use emulators before connecting real users. Do not deploy this starter's deny-all rules over an existing working project's rules. No deployment is performed automatically by the CI workflow.
