# F23 — Privacy and Account Requests
## Owner and stage
Person 2 • P1 automation; P0 manual process
Routes: /profile → privacy
## User goal
Provide export/deletion request handling and clear data visibility.
## Frontend work
Explain public versus private fields; submit export or delete request; reauthenticate before deletion request; show pending/completed state.
## Backend work
requestPrivacyAction queues own request. Admin job handles pending rides and reports according to written retention policy; exports own data through protected expiring delivery; anonymizes retained references before Auth removal. Purge push tokens and avatars.
## APIs and data
requestPrivacyAction; privacyRequests; audited worker
Exact payloads and authorization are defined in shared/04_API_CONTRACT.md; canonical fields are in shared/03_DATABASE.md. Use those names rather than inventing competing schemas.
## Validation and edge cases
Do not promise immediate total erasure if shared conversation/report records need review. Never export another user’s private account data or raw server logs. Real retention periods must be agreed before pilot.
## Acceptance tests
Different uid request rejected; confirmation required for deletion; suspended account has a support/request route; manual requests can be handled before automation.
## Dependencies and handoff
F01; admin operations policy; retention decision.
Provide a short demonstration, one failure/unauthorized case and the reviewed pull request. All implementation remains proposed until that evidence exists. See shared/05_SECURITY_AND_TESTS.md for cross-feature checks.
