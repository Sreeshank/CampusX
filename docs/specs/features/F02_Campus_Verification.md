# F02 — Campus Verification
## Owner and stage
Person 2 • P0
Routes: /verify; /admin/verifications
## User goal
Make campus membership an explicit approval step.
## Frontend work
Student sees pending/approved/rejected status and resubmit instructions. Admin sees name, verified email and request status with approve/reject controls.
## Backend work
submitVerification creates one pending request. reviewVerification checks admin authorization and an offline roster/in-person check; updates users, publicProfiles and request in a transaction. Log reviewer and reason.
## APIs and data
submitVerification; reviewVerification; verificationRequests; users; publicProfiles
Exact payloads and authorization are defined in shared/04_API_CONTRACT.md; canonical fields are in shared/03_DATABASE.md. Use those names rather than inventing competing schemas.
## Validation and edge cases
Do not invent an official college email domain. Keep approvedEmailDomains empty until independently confirmed. Rejected applicants can submit a new request after correction; retain prior decisions in audit log.
## Acceptance tests
Self-approval denied; unverified email rejected; pending member cannot post; approval enables campus routes.
## Dependencies and handoff
F01; first admin bootstrap; agreed human verification process.
Provide a short demonstration, one failure/unauthorized case and the reviewed pull request. All implementation remains proposed until that evidence exists. See shared/05_SECURITY_AND_TESTS.md for cross-feature checks.
