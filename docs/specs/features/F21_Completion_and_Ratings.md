# F21 — Completion and Ratings
## Owner and stage
Person 2 • P1
Routes: Post-completion review dialog; public profile
## User goal
Display feedback tied to an actual confirmed context.
## Frontend work
Star selection 1–5 and optional short text; mark context and review count; no fabricated initial ratings. Person 1 implements deal-confirmation UI/server functions; Person 3 supplies completed ride context.
## Backend work
For listings proposeDeal identifies a genuine conversation counterpart; both confirmDeal participants must confirm handoff. submitReview validates confirmed deal or completed ride with accepted request, counterpart identity and unique direction. Aggregate rating sum/count server-side transactionally.
## APIs and data
proposeDeal; confirmDeal; submitReview; deals; reviews; publicProfiles
Exact payloads and authorization are defined in shared/04_API_CONTRACT.md; canonical fields are in shared/03_DATABASE.md. Use those names rather than inventing competing schemas.
## Validation and edge cases
No self-review; one per context/direction; cancelled request cannot review ride. P0 seller-marked sold alone is not sufficient. Hidden review must adjust visible aggregate once.
## Acceptance tests
Unrelated account denied; duplicate review denied; valid review updates average once; unconfirmed deal blocked.
## Dependencies and handoff
F10/F16 completion; F17 conversation.
Provide a short demonstration, one failure/unauthorized case and the reviewed pull request. All implementation remains proposed until that evidence exists. See shared/05_SECURITY_AND_TESTS.md for cross-feature checks.
