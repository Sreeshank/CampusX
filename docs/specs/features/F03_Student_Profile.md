# F03 — Student Profile
## Owner and stage
Person 2 • P0
Routes: /profile
## User goal
Let students manage a limited public profile and private account details.
## Frontend work
Editable name, department, year and optional avatar; verification status read-only. Separate private email display from public profile card.
## Backend work
updateProfile allowlists editable fields and writes safe public projection. Read private users only for self/admin; publicProfiles for campus cards.
## APIs and data
updateProfile; users; publicProfiles; avatars Storage
Exact payloads and authorization are defined in shared/04_API_CONTRACT.md; canonical fields are in shared/03_DATABASE.md. Use those names rather than inventing competing schemas.
## Validation and edge cases
No editable role, campus approval or rating counters. Reject invalid avatar paths/types. Department/year optional; never require phone numbers for P0.
## Acceptance tests
Profile changes appear on own screen and public card; another student cannot read private email or modify profile.
## Dependencies and handoff
F01–F02; F07 uploads.
Provide a short demonstration, one failure/unauthorized case and the reviewed pull request. All implementation remains proposed until that evidence exists. See shared/05_SECURITY_AND_TESTS.md for cross-feature checks.
