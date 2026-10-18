# F05 — Marketplace Search and Filters
## Owner and stage
Person 1 • P0
Routes: /xchange
## User goal
Discover campus items using predictable browsing and search.
## Frontend work
Cards with photo/title/price or Swap/Free; category and mode filters; title-prefix search; supported price sort; loading/empty/error and Load more.
## Backend work
Query active same-campus listings using shared query plan. Normalize titles on server. Use cursor pagination and indexes; no full collection download.
## APIs and data
listListings; listings; firestore.indexes.json
Exact payloads and authorization are defined in shared/04_API_CONTRACT.md; canonical fields are in shared/03_DATABASE.md. Use those names rather than inventing competing schemas.
## Validation and edge cases
Search is title-prefix only in v1. Select one supported sort/query mode at a time. Clear incompatible controls rather than silently ignoring them.
## Acceptance tests
Search engineering finds Engineering Mathematics; category filter works; duplicate rows do not appear across pages; other-campus listings never appear.
## Dependencies and handoff
F06 listings; shared query/index plan.
Provide a short demonstration, one failure/unauthorized case and the reviewed pull request. All implementation remains proposed until that evidence exists. See shared/05_SECURITY_AND_TESTS.md for cross-feature checks.
