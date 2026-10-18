# Setup, API keys and environment configuration
## What is and is not supplied
This ZIP includes placeholders and setup instructions, not working keys. Nobody has provided an existing Firebase or Google Cloud project. Create those accounts/project resources and copy the values shown by their consoles. Do not paste private service-account keys into ChatGPT or a team document.

## Key inventory
| Value | Required? | Where to obtain it | Where it belongs |
| --- | --- | --- | --- |
| Firebase apiKey | P0 | Firebase console → Project settings → your registered Web app → SDK configuration | VITE_FIREBASE_API_KEY; browser-visible project identifier |
| authDomain, projectId, storageBucket, messagingSenderId, appId | P0 | Same Web app config; copy actual values, do not infer bucket suffix | Corresponding VITE_FIREBASE_* variables |
| Functions region | P0 | Region chosen in functions configuration | VITE_FUNCTIONS_REGION; same client/server region |
| Admin SDK credentials | Server authorization, not a public API key | Managed functions use application default credentials | Managed server identity; never VITE_* or browser bundle |
| Firebase CLI access | Setup/deployment | Each member signs in with firebase login and granted project access | Local tooling, never repository |
| Google Maps browser API key | P1 only | Google Cloud Console → APIs & Services → Credentials | VITE_GOOGLE_MAPS_API_KEY; restrict HTTP referrers and enabled APIs |
| Web push VAPID public key | P1 only | Firebase project settings → Cloud Messaging → Web Push certificates | VITE_FIREBASE_VAPID_KEY; public value |
| App Check reCAPTCHA Enterprise site key | Before public-scale pilot | Configure Web App Check provider for your domains | VITE_RECAPTCHA_SITE_KEY; public site key |
| Payment provider credentials | P2 only | Selected provider after business/onboarding decision | Separate public checkout value and server-only secret; not in P0 |
| OpenAI API key | Not required | None for these CampusX features | Do not add one just because developers use AI tools |

Firebase's web API key is not the authorization boundary. Protect data with rules, server checks and appropriate application restrictions. All VITE_* variables are bundled into the browser; .env.local does not make them secret. Maps keys have usage/billing implications and must be restricted separately. Do not share a single Google account password among developers.

## Person 2: configure the shared development project
1. Create separate development and production Firebase projects when preparing a real pilot. Give members only the project permissions needed for development; reserve production deployment and admin role assignment for the leader/platform owner.
2. Register a Web app. Enable email/password sign-in. Set authorized domains for local development and hosting explicitly; confirm localhost is allowed when needed.
3. Create Firestore and Storage with a deliberate data location. Use locked-down rules, not public test rules. Choose one Functions region (example asia-south1) and set the client to match; verify service availability in the chosen region.
4. Cloud Storage for Firebase currently requires the Blaze plan. Deployed Cloud Functions also require billing setup. Start with emulators if billing is not ready. Set budget alerts and quotas; alerts are not a hard spending cap.
5. Establish campus membership approval. No official KITS email domain is assumed by this pack. Pilot default: verified email plus manual roster/in-person approval by a designated admin. Email verification alone does not establish college membership.
6. Create the first admin using a privileged local script or trusted console workflow, not a public signup field. Write the approved role to the protected users document and synchronize the admin custom claim. Retain an audit record.
7. Copy the public Web config into each member’s .env.local. Commit only .env.example. Configure hosted build values separately.

## Leader: scaffold once (PowerShell or terminal)
Install a current patched Node 22 release, at least 22.12; the checked Vite guide requires 20.19+ or 22.12+. Use Node 22 for the functions runtime as supported in the checked Firebase guide. Confirm requirements again if the scaffold reports a newer minimum.
```bash
npm create vite@latest campusx -- --template react-ts
cd campusx
npm install
npm install firebase react-router-dom zod
npm install -D vitest @testing-library/react @testing-library/jest-dom @playwright/test @firebase/rules-unit-testing
npm install -g firebase-tools
firebase login
firebase init
```
In firebase init select the existing development project; Firestore, Functions (TypeScript), Storage, Hosting and Emulators. Hosting public directory: dist. Configure single-page rewrite to /index.html. Do not overwrite source files unintentionally. Choose Auth, Firestore, Functions and Storage emulators. Set functions/package.json engines.node to 22 and confirm generated build settings. Run npm --prefix functions install zod if server schemas use Zod; firebase init normally installs firebase-admin and firebase-functions in functions/package.json. Keep those server dependencies separate from frontend dependencies. Install the Java version required by the currently installed emulator tooling if requested.

## Every member: clone and run
```bash
git clone YOUR_REPOSITORY_URL
cd campusx
npm ci
```
Copy templates/frontend.env.example to the app root as .env.local; fill real development values or use the documented demo emulator configuration. Run firebase emulators:start in one terminal; run npm run dev in another. Compile the functions TypeScript first with npm --prefix functions run build, and use its generated watch command while developing. The Vite app must explicitly connect every SDK service to its emulator before any operations.

Use VITE_USE_EMULATORS=true only locally. Local emulator project ID can be demo-campusx with placeholder config. Auth emulator users are separate from production users. Use a deliberate seed script for fictional approved and pending accounts. Do not bypass checks in deployed functions to make local testing easier.

## Deployment workflow (not performed by this pack)
1. Run tests and npm run build; build functions.
2. Select the intended project alias explicitly; confirm its project ID.
3. Deploy reviewed rules, indexes and functions, then Hosting. Wait for indexes to finish building.
4. Ensure VITE_USE_EMULATORS=false at build time. Rebuild after changing frontend environment values.
5. Confirm authorized domains, HTTPS, SPA deep-link refresh, and two-account tests on the hosted app.
6. Keep dev and production data separate. Never deploy deny-all or permissive sample rules as a substitute for the reviewed real rules.

## Troubleshooting
Permission denied: check auth, email verification, campus status and query predicates before editing rules.
Callable not found: compare deployed export name, region and selected project.
Missing index: create the specific composite index from the console error and commit its definition.
Storage failure: check billing, bucket value, upload path, MIME type and rules.
Unauthorized domain: update Auth authorized domains for the actual site.
Blank deep link: configure Hosting SPA rewrite.
