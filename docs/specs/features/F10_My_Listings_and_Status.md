# F10 — My Listings and Status
## Owner and stage
Person 1 • P0
Routes: /my-listings
## User goal
Manage the lifecycle of owned items.
## Frontend work
Tabs Active/Reserved/Completed/Withdrawn; edit, reserve, make available, mark completed and withdraw actions; confirmation for destructive-looking actions.
## Backend work
Use setListingStatus and permitted state transitions. Delete action is soft withdrawal; server preserves references needed for reports/history. Admin removal cannot be undone by owner.
## APIs and data
listMyListings; setListingStatus
Exact payloads and authorization are defined in shared/04_API_CONTRACT.md; canonical fields are in shared/03_DATABASE.md. Use those names rather than inventing competing schemas.
## Validation and edge cases
Completed/withdrawn terminal in v1; create new listing to relist. Restrict owner and stale-update conditions. Self-reported completion is labelled accordingly.
## Acceptance tests
Another student denied; removed item cannot reactivate; reserve/unreserve works; completion leaves browse feed.
## Dependencies and handoff
F06; F08.
Provide a short demonstration, one failure/unauthorized case and the reviewed pull request. All implementation remains proposed until that evidence exists. See shared/05_SECURITY_AND_TESTS.md for cross-feature checks.
