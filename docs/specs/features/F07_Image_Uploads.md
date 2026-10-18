# F07 — Image Uploads
## Owner and stage
Person 2 • P0
Routes: Shared listing/avatar upload component
## User goal
Store user-owned images with bounded resource use.
## Frontend work
File picker with previews, upload progress, remove/retry actions, type and size errors. Person 1 integrates listing picker; Person 2 supplies upload adapter and rules.
## Backend work
Use uploadBytesResumable to owner path; check MIME and size in Storage rules and confirm references server-side. Max 5 MiB/listing image and 2 MiB/avatar. Use authenticated downloads for private campus images.
## APIs and data
Firebase Storage SDK; listing-images/{uid}/...; avatars/{uid}/...
Exact payloads and authorization are defined in shared/04_API_CONTRACT.md; canonical fields are in shared/03_DATABASE.md. Use those names rather than inventing competing schemas.
## Validation and edge cases
JPEG/PNG/WebP only; no SVG or executable content; random object names. Strip EXIF when re-encoding uploaded images where practical. Reject arbitrary external image URL fields.
## Acceptance tests
Other user cannot overwrite image; 6 MiB rejected; failed upload does not publish dangling listing; retry works; orphan cleanup preserves referenced images.
## Dependencies and handoff
Billing-enabled Storage or emulator; reviewed Storage rules.
Provide a short demonstration, one failure/unauthorized case and the reviewed pull request. All implementation remains proposed until that evidence exists. See shared/05_SECURITY_AND_TESTS.md for cross-feature checks.
