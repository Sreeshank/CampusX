# F24 — Responsive Web and Deployment
## Owner and stage
Person 1 • P0
Routes: All routes
## User goal
Deliver a usable browser app on phones and desktops.
## Frontend work
Responsive navigation, readable forms, keyboard focus, touch-friendly actions, error boundaries and not-found screen. Inform user of failed actions instead of silently assuming offline success.
## Backend work
Build with Vite; configure Hosting SPA rewrite. Person 2 owns rules/index/function deployment. Use separate dev/prod config. No service worker caching of private data in P0.
## APIs and data
Firebase Hosting; build pipeline; shared adapters
Exact payloads and authorization are defined in shared/04_API_CONTRACT.md; canonical fields are in shared/03_DATABASE.md. Use those names rather than inventing competing schemas.
## Validation and edge cases
Do not label site installable PWA until manifest/service worker and offline/privacy behaviour are tested. Do not embed server credentials in frontend environment.
## Acceptance tests
Refresh nested URL; test two screen widths; keyboard form entry; production bundle contains no secret; deployed app uses correct project and rules.
## Dependencies and handoff
All P0 features; shared release checks.
Provide a short demonstration, one failure/unauthorized case and the reviewed pull request. All implementation remains proposed until that evidence exists. See shared/05_SECURITY_AND_TESTS.md for cross-feature checks.
