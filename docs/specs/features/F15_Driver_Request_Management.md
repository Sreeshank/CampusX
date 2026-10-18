# F15 — Driver Request Management
## Owner and stage
Person 3 • P0
Routes: /my-rides → offer → requests
## User goal
Allow drivers to accept or reject ride requests without overbooking.
## Frontend work
List only requests for owned ride, with passenger public profile and pending/accepted labels; Accept/Reject actions with progress and errors.
## Backend work
respondToRideRequest executes transaction algorithm in API contract. Read all required documents before writes. Check live eligibility and blocks. Notification event recorded transactionally.
## APIs and data
listDriverRequests; respondToRideRequest
Exact payloads and authorization are defined in shared/04_API_CONTRACT.md; canonical fields are in shared/03_DATABASE.md. Use those names rather than inventing competing schemas.
## Validation and edge cases
Only actual driver; accepting decrements once; rejection does not decrement. If full, explain request cannot be accepted. No client-side seat writes.
## Acceptance tests
Run simultaneous accepts against final seat; exactly one succeeds. Retry returns same state. Forged driver call denied.
## Dependencies and handoff
F14; platform transaction/idempotency helpers.
Provide a short demonstration, one failure/unauthorized case and the reviewed pull request. All implementation remains proposed until that evidence exists. See shared/05_SECURITY_AND_TESTS.md for cross-feature checks.
