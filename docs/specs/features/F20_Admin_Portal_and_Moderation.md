# F20 — Admin Portal and Moderation
## Owner and stage
Person 2 • P0
Routes: /admin and subroutes
## User goal
Review membership and reported content with accountable actions.
## Frontend work
Dashboard with bounded queues, verification list, report details, user suspend/restore and listing removal. Use pagination; empty/loading/error states.
## Backend work
Require trusted admin claim plus protected active admin role. reviewReport records outcome; moderateEntity requires reason and appends audit log. Private chat evidence retrieved only through audited report-specific server flow, not an unrestricted chat browser.
## APIs and data
reviewVerification; reviewReport; moderateEntity; auditLogs
Exact payloads and authorization are defined in shared/04_API_CONTRACT.md; canonical fields are in shared/03_DATABASE.md. Use those names rather than inventing competing schemas.
## Validation and edge cases
No role assignment in browser. Prevent removing final active admin. Suspension blocks immediate reads/calls and queues listing/ride closures with participant notices. Admin actions do not change historical messages.
## Acceptance tests
Student route/API access denied; each action has actor/time/reason; repeated moderation does not duplicate harmful side effects.
## Dependencies and handoff
F02; F19; trusted first-admin bootstrap.
Provide a short demonstration, one failure/unauthorized case and the reviewed pull request. All implementation remains proposed until that evidence exists. See shared/05_SECURITY_AND_TESTS.md for cross-feature checks.
