# F18 — Notifications
## Owner and stage
Person 2 • P1
Routes: /notifications and optional browser permission prompt
## User goal
Inform students about new messages and ride decisions.
## Frontend work
Unread badge and in-app list; link to permitted entity; mark read; optional Enable browser notifications button.
## Backend work
Create deterministic per-event notification IDs after committed business action. In-app notifications need Firestore only. Optional FCM push needs HTTPS, service worker, permission and public VAPID key; server sends via Admin SDK.
## APIs and data
markNotificationRead; registerPushToken; removePushToken; notifications; pushTokens
Exact payloads and authorization are defined in shared/04_API_CONTRACT.md; canonical fields are in shared/03_DATABASE.md. Use those names rather than inventing competing schemas.
## Validation and edge cases
No prompt on first page load; ask only after user action. Browser support varies; in-app list remains functional on denial. Avoid private message text in lock-screen payload. Deduplicate retries.
## Acceptance tests
Acceptance creates one notice; only recipient reads it; denied push permission does not break app; logout removes device registration.
## Dependencies and handoff
F15/F17 events; optional FCM setup.
Provide a short demonstration, one failure/unauthorized case and the reviewed pull request. All implementation remains proposed until that evidence exists. See shared/05_SECURITY_AND_TESTS.md for cross-feature checks.
