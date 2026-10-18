# F25 — Future Business Features
## Owner and stage
Person 1 • P2 — not first prototype
Routes: Future admin and student settings
## User goal
Document business ideas without treating them as implemented or validated.
## Frontend work
Potential promoted listing purchase, sponsorship placements, optional subscriptions, referral codes and campus selection. Each requires a new approved scope and UI design before implementation.
## Backend work
Do not add payment keys now. Future checkout requires server-generated orders, verified webhooks, idempotent payment state, refunds, ledger and entitlement enforcement. Multi-campus requires explicit membership and isolation changes.
## APIs and data
No P0 API. Future contracts must be designed and reviewed; never simulate successful real payment.
Exact payloads and authorization are defined in shared/04_API_CONTRACT.md; canonical fields are in shared/03_DATABASE.md. Use those names rather than inventing competing schemas.
## Validation and edge cases
Advertising labels, willingness to pay, fees, eligibility and institution policies are unresolved. Analytics must avoid private content. Financial projections from source brief are unvalidated and not inputs to this build.
## Acceptance tests
P0 release has no dead Buy promotion/Subscribe buttons or unverified revenue metrics; future feature issues record provider/cost/permissions decisions first.
## Dependencies and handoff
Validated pilot demand and separately approved scope.
Provide a short demonstration, one failure/unauthorized case and the reviewed pull request. All implementation remains proposed until that evidence exists. See shared/05_SECURITY_AND_TESTS.md for cross-feature checks.
