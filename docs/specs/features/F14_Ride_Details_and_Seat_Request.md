# F14 — Ride Details and Seat Request
## Owner and stage
Person 3 • P0
Routes: /xride/:rideId
## User goal
Review a ride and request one seat.
## Frontend work
Route points, time, vehicle type, seats, cost share, driver card, Request Seat button; show Pending after submission and Await driver confirmation.
## Backend work
requestRide validates live parent state and fixed rideId_uid identity. One seat per request. Pending does not reserve capacity. Display effective cancellation if parent closes.
## APIs and data
watchRide; requestRide; rideRequests
Exact payloads and authorization are defined in shared/04_API_CONTRACT.md; canonical fields are in shared/03_DATABASE.md. Use those names rather than inventing competing schemas.
## Validation and edge cases
Reject self-booking, past/full/cancelled rides, other-campus and blocked counterpart. A pending request is not a confirmed ride.
## Acceptance tests
Two clicks return one request; pending badge survives refresh; driver cannot book own ride.
## Dependencies and handoff
F12–F13; account helper and F19 blocks.
Provide a short demonstration, one failure/unauthorized case and the reviewed pull request. All implementation remains proposed until that evidence exists. See shared/05_SECURITY_AND_TESTS.md for cross-feature checks.
