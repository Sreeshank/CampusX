# F22 — Map Display and Location
## Owner and stage
Person 3 • P1
Routes: Ride details; optional pickup selection
## User goal
Add a useful location reference without changing booking semantics.
## Frontend work
Map with selected public pickup/destination markers; textual fallback; Open directions link. Route-line rendering is an optional later integration.
## Backend work
Use approved point coordinates in campus config. If using Google Maps JavaScript API, configure restricted browser key and billing. Do not call geocoding/routes services unless explicitly enabled and separately documented.
## APIs and data
Google Maps JavaScript API optional; campus point coordinates
Exact payloads and authorization are defined in shared/04_API_CONTRACT.md; canonical fields are in shared/03_DATABASE.md. Use those names rather than inventing competing schemas.
## Validation and edge cases
No background/live driver tracking. Do not present a straight line as a navigable road route. Location permission is optional, requested only on action; never block typed/selected points.
## Acceptance tests
No key/denied location/map outage still allows ride request through text UI; no student home coordinates appear.
## Dependencies and handoff
F12–F14; optional key and budget setup.
Provide a short demonstration, one failure/unauthorized case and the reviewed pull request. All implementation remains proposed until that evidence exists. See shared/05_SECURITY_AND_TESTS.md for cross-feature checks.
