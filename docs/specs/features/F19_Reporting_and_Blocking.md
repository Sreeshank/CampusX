# F19 — Reporting and Blocking
## Owner and stage
Person 2 • P0
Routes: Shared report dialogs; profile block controls
## User goal
Give students a way to report inappropriate content and stop contact.
## Frontend work
Report reason, optional explanation, submission receipt; block/unblock with clear effect. Persons 1/3 add module entry points; Person 2 supplies shared controls/service.
## Backend work
submitReport validates target access and immutable reporter/campus fields. setUserBlock writes own block relation. Check either direction for messages/new ride requests; accepted rides are not silently cancelled by blocking. Offer separate cancellation/report actions.
## APIs and data
submitReport; setUserBlock; reports; blocks
Exact payloads and authorization are defined in shared/04_API_CONTRACT.md; canonical fields are in shared/03_DATABASE.md. Use those names rather than inventing competing schemas.
## Validation and edge cases
Reporter cannot read internal moderation notes. Do not expose report author to target. Allow report submission even when counterpart blocked.
## Acceptance tests
Outsider cannot report a private message they cannot access; duplicate submit deduplicates; blocked student cannot send; report remains reviewable.
## Dependencies and handoff
F17; F20 admin workflow.
Provide a short demonstration, one failure/unauthorized case and the reviewed pull request. All implementation remains proposed until that evidence exists. See shared/05_SECURITY_AND_TESTS.md for cross-feature checks.
