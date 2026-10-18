# Shared architecture and frontend conventions
## Selected stack
React + TypeScript + Vite; React Router; plain CSS/CSS modules; Firebase Authentication; Firestore; Cloud Storage; second-generation Firebase callable Cloud Functions; Firebase Hosting. This is a browser app, not React Native or Expo. No separate Express server, SQL database or payment service is needed for P0.

## Data flow
Browser uses Firebase Auth for login. It reads Firestore through access-controlled queries and uploads approved image types to a user-owned Storage path. Business mutations call Firebase callable functions. Functions verify the caller, read account status/campus membership, validate fields, and write using Admin SDK. Admin SDK bypasses Firestore rules, so each callable must implement its own checks. In-app subscriptions update screens. Use HTTPS Hosting in deployed environments.

## Portal and route map
| Route | Access | Owner |
| --- | --- | --- |
| /, /login, /register, /forgot-password | Public landing/auth only | 1 landing; 2 auth |
| /verify, /profile | Signed in, including pending members | 2 |
| /home | Active verified campus student | 1 |
| /xchange, /xchange/:listingId, /xchange/new, /xchange/:listingId/edit, /my-listings, /saved | Verified; edits additionally owner | 1 |
| /xride, /xride/new, /xride/:rideId, /my-rides | Verified; management additionally driver | 3 |
| /messages, /messages/:conversationId | Verified participant | 2; entry points 1 and 3 |
| /notifications | Own account | 2 |
| /admin, /admin/verifications, /admin/reports, /admin/users, /admin/listings | Active admin | 2 |

## Proposed repository layout
```text
campusx/
  src/app/                 # router, providers, layout
  src/components/          # shared UI
  src/lib/                 # firebase initialization and adapters
  src/features/            # home, auth, profile, xchange, xride, messages, admin
  shared/                  # types, schemas, constants (imported by app and functions)
  functions/src/platform/  # auth helpers, messaging, admin
  functions/src/xchange/   # Person 1 server logic
  functions/src/xride/     # Person 3 server logic
  tests/                   # rules, integration, browser flows
  firestore.rules
  firestore.indexes.json
  storage.rules
  firebase.json
  .env.example
```
Keep TypeScript shared-module compilation consistent between Vite and the functions build. Either configure both builds to compile shared/ or publish a local workspace package; do not rely on a frontend-only alias in functions.

## Visual system
Use violet #6534E8 as primary, white cards, pale lavender surfaces and dark navy text. Show CampusX, XChange and XRide with these spellings. Mobile: bottom navigation Home/XChange/XRide/Profile; desktop: sidebar or header navigation. Provide a persistent Messages entry. Use readable labels, keyboard focus, descriptive form errors and adequate contrast. Do not copy unverified ratings/badges from mockups. Currency display is INR; dates display in Asia/Kolkata.

## Shared implementation rules
Use typed service adapters so UI components do not duplicate Firebase queries. Return normalized UI models with id included. Database timestamps become ISO strings at adapter boundaries; writes use server timestamps except user-selected future departure time. Validate local departure input in Asia/Kolkata before converting to UTC. Store pricePaise/costSharePaise as non-negative integer paise.
Use 20 items per feed page, maximum 50. Unsubscribe listeners on route change/logout. Never download an entire collection for search or admin counters. Search v1 is normalized title-prefix search, not full-text relevance; label it accurately. Composite query/index combinations must be tested in staging.

## Dependency strategy
Scaffold once, record exact working dependencies in package-lock.json and use npm ci thereafter. Agree dependency additions before merging. Do not assume generated AI package versions exist. Firebase and Vite documentation links in 07_SOURCES.md are the source for supported setup.
