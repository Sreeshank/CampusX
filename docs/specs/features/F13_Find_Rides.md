# F13 — Find Rides
## Owner and stage
Person 3 • P0
Routes: /xride
## User goal
Find scheduled campus rides matching a route/date.
## Frontend work
Pickup, destination and date controls; ride cards with departure, public driver name, seats and cost share; no fake minutes-away indicator.
## Backend work
listRides uses exact configured point IDs and UTC range for the chosen local day. Sort departure ascending and paginate; treat cancelled/full/expired rides accurately.
## APIs and data
listRides; rides; indexes
Exact payloads and authorization are defined in shared/04_API_CONTRACT.md; canonical fields are in shared/03_DATABASE.md. Use those names rather than inventing competing schemas.
## Validation and edge cases
P0 is exact point matching, not nearest-route optimization. Mark no results after relevant pages are exhausted. Compute day boundaries in Asia/Kolkata.
## Acceptance tests
Matching future ride returned; reverse route not confused; midnight boundary works; stale full ride cannot be booked.
## Dependencies and handoff
F12; F14 server checks.
Provide a short demonstration, one failure/unauthorized case and the reviewed pull request. All implementation remains proposed until that evidence exists. See shared/05_SECURITY_AND_TESTS.md for cross-feature checks.
