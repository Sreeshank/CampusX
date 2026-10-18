# F16 — Ride Cancellation and History
## Owner and stage
Person 3 • P0
Routes: /my-rides
## User goal
Show offers and passenger requests with correct terminal states.
## Frontend work
Separate Offered/Requested tabs; cancel-request, cancel-offer and complete actions; cancellation reason; completed/cancelled history; messaging link for relevant participants.
## Backend work
cancelRideRequest releases one seat only if previously accepted and before departure. cancelRide closes parent first, then fanout cancellation through retry-safe jobs. completeRide only after departure.
## APIs and data
cancelRideRequest; cancelRide; completeRide; listMyRideRequests
Exact payloads and authorization are defined in shared/04_API_CONTRACT.md; canonical fields are in shared/03_DATABASE.md. Use those names rather than inventing competing schemas.
## Validation and edge cases
No reopen in v1. History overlays parent status so unfinished fanout never shows an active cancelled ride. Retain data for reports; no hard delete.
## Acceptance tests
Cancel pending releases none; cancel accepted restores one once; driver cancellation prevents all new acceptances immediately.
## Dependencies and handoff
F14–F15; notification adapter.
Provide a short demonstration, one failure/unauthorized case and the reviewed pull request. All implementation remains proposed until that evidence exists. See shared/05_SECURITY_AND_TESTS.md for cross-feature checks.
