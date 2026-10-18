# F12 — Offer and Edit Rides
## Owner and stage
Person 3 • P0
Routes: /xride/new; /my-rides
## User goal
Publish a scheduled ride with available passenger capacity.
## Frontend work
Pickup/destination selectors using approved public points, date/time, seats, vehicle type, cost share per passenger, notes; preview before submit.
## Backend work
createRide resolves labels from campus points and sets driver/campus. Store UTC departure and integer paise. updateRide checks owner, future departure, stale edits and accepted passengers.
## APIs and data
createRide; updateRide; rides
Exact payloads and authorization are defined in shared/04_API_CONTRACT.md; canonical fields are in shared/03_DATABASE.md. Use those names rather than inventing competing schemas.
## Validation and edge cases
Different points; future time; seats 1–6, twoWheeler at most 1 passenger; nonnegative cost share. Do not ask for or show live location. No route/time/cost/capacity change after acceptance.
## Acceptance tests
Valid ride visible; past time and same point rejected; duplicate click creates one ride; edit with accepted passenger fails with cancel/recreate instruction.
## Dependencies and handoff
F02; campus point configuration; shared time conversion.
Provide a short demonstration, one failure/unauthorized case and the reviewed pull request. All implementation remains proposed until that evidence exists. See shared/05_SECURITY_AND_TESTS.md for cross-feature checks.
