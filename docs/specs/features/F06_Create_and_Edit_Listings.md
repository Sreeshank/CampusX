# F06 — Create and Edit Listings
## Owner and stage
Person 1 • P0
Routes: /xchange/new; /xchange/:listingId/edit
## User goal
Publish or update an item offered by a student.
## Frontend work
Form for title, description, category, condition, sale/swap/donation, price or wanted swap, and 1–5 images. Preview and publish button; preserve draft on error.
## Backend work
Upload images first, then createListing. Server validates owned objects and sets campus/owner/status/time. updateListing uses expectedUpdatedAt to detect conflicting edits.
## APIs and data
createListing; updateListing; listings; operations
Exact payloads and authorization are defined in shared/04_API_CONTRACT.md; canonical fields are in shared/03_DATABASE.md. Use those names rather than inventing competing schemas.
## Validation and edge cases
Title 3–100; description 10–2000; enum fields; at least one image; finite integer paise; donation 0, swap null, sale positive. Disable duplicate submit but also use backend idempotency.
## Acceptance tests
Reload finds saved item; duplicate submission produces one record; unauthorized edit and stale update fail.
## Dependencies and handoff
F02; F07; validation helpers.
Provide a short demonstration, one failure/unauthorized case and the reviewed pull request. All implementation remains proposed until that evidence exists. See shared/05_SECURITY_AND_TESTS.md for cross-feature checks.
