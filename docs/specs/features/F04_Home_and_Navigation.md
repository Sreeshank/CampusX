# F04 — Home and Navigation
## Owner and stage
Person 1 • P0
Routes: /home
## User goal
Give students a clear entry to both modules.
## Frontend work
CampusX header, campus name, XChange/XRide cards, latest six listings, Messages entry and profile access. Mobile bottom bar; desktop navigation.
## Backend work
Read bounded permitted listing query and current profile. Do not create a separate backend just for this page. Reuse feed adapter.
## APIs and data
listListings; watchCurrentUser
Exact payloads and authorization are defined in shared/04_API_CONTRACT.md; canonical fields are in shared/03_DATABASE.md. Use those names rather than inventing competing schemas.
## Validation and edge cases
Handle new campus with no content and pending verification redirect. Do not display sample activity counts as real metrics.
## Acceptance tests
Both module links work; keyboard navigation works; layout fits 360px; loading failure has retry.
## Dependencies and handoff
F01–F03; shared shell; F05 listing feed.
Provide a short demonstration, one failure/unauthorized case and the reviewed pull request. All implementation remains proposed until that evidence exists. See shared/05_SECURITY_AND_TESTS.md for cross-feature checks.
