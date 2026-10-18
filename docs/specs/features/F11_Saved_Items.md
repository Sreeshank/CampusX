# F11 — Saved Items
## Owner and stage
Person 1 • P1
Routes: /saved
## User goal
Bookmark useful marketplace listings.
## Frontend work
Heart toggle on cards/details; saved page; missing or removed item shown unavailable with remove option.
## Backend work
Person 2 supplies setSavedListing; Person 1 implements UI/read adapter. Save own subcollection ref; never duplicate the full listing as authoritative data.
## APIs and data
setSavedListing; users/{uid}/saved; listSavedListings
Exact payloads and authorization are defined in shared/04_API_CONTRACT.md; canonical fields are in shared/03_DATABASE.md. Use those names rather than inventing competing schemas.
## Validation and edge cases
No cross-user saved list reads. Treat concurrent toggles predictably; optimistic UI rolls back on error.
## Acceptance tests
Saved items survive refresh; unsave works; removed target does not crash page.
## Dependencies and handoff
F05/F08 and platform callable.
Provide a short demonstration, one failure/unauthorized case and the reviewed pull request. All implementation remains proposed until that evidence exists. See shared/05_SECURITY_AND_TESTS.md for cross-feature checks.
