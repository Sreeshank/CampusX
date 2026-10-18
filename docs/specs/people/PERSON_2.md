# Person 2 — Accounts, Administration and Platform
## Your outcome
Own account lifecycle, the admin portal, shared services and security review. Supply reusable helpers early so the other members can implement their module backends.
## Tools to use
React + TypeScript + Vite for browser screens; React Router for navigation; CSS for shared styling; Firebase modular Web SDK for authentication and authorized reads; TypeScript Cloud Functions for trusted writes; Vitest and Firebase Emulator Suite for meaningful unit/permission tests; Playwright for browser flows. Use VS Code and one shared Git repository.
## Your owned folders
src/lib/firebase.ts, src/features/auth/, src/features/profile/, src/features/admin/, src/features/messages/, src/features/notifications/, functions/src/platform/, firestore.rules, storage.rules
These are proposed application paths, not files already implemented in this documentation ZIP.
## Work sequence
Create Firebase/emulators and shared types first; implement authentication and profile bootstrap; add manual campus approval and admin bootstrap; provide requireActiveUser, requireVerifiedCampus, requireAdmin and input validation helpers; implement chat/report services and admin UI; finish rules tests and deploy checklist.
## Frontend responsibilities
Use the shared buttons, fields, cards and status components. Follow the exact shared TypeScript field names and callable contracts. Every screen includes loading, empty, error and disabled-submit states. Preserve form input after failure. Route guards improve UX; server checks provide security. Test a 360px-wide phone layout and a desktop layout.
## Backend responsibilities
Use the authentication and campus helpers defined by Person 2. Derive uid from the verified callable context; never trust a submitted ownerId or role. Validate each field again server-side. Use server timestamps, integer paise for money, cursor pagination and deterministic retry keys. Do not write another member’s function files without agreeing first.
## Keys and configuration
Read shared/02_SETUP_AND_KEYS.md. All three use the same development project’s public Firebase web configuration in their own .env.local files. No member needs a personal OpenAI API key to run CampusX. Never put an Admin SDK credential in frontend files. Person 2 manages platform configuration, but every member signs into development tools using their own authorized account.
## Dependencies and handoff
All members agree shared types, route names, campusId and error codes before coding. Request changes through a pull request with an example input/output. Persons 1 and 3 may use mock adapters while Person 2 finishes shared functions; mocks must return exactly the agreed shapes and be disabled in the deployed app.
## Acceptance checklist
An unverified email cannot enter the campus feed; a pending campus account cannot publish; students cannot grant themselves admin; banned users lose data access immediately; an outsider cannot read messages; upload paths cannot be forged.
## Daily update to the leader
Completed: issue IDs and demo. Next: one small task. Blocked: exact error and the owner needed. Include no credentials in screenshots or logs.
## AI-assisted implementation prompt
“Implement one assigned CampusX feature using its feature specification and the shared architecture, database and API contract. Stay inside my owned files. Show validation and access checks. Add tests for failure and unauthorized access. Do not invent credentials, claim tests passed without running them, or change shared contracts silently.”
## Definition of handoff
Open a reviewed pull request with screen screenshots, changed API/schema details, tests actually run, remaining issues, and a short two-account demonstration. Do not send copied project folders or overwrite another person’s working tree.

## Assigned feature specifications
- F01 Authentication (P0) — features/F01_Authentication.md
- F02 Campus Verification (P0) — features/F02_Campus_Verification.md
- F03 Student Profile (P0) — features/F03_Student_Profile.md
- F07 Image Uploads (P0) — features/F07_Image_Uploads.md
- F17 Messages and Inbox (P0) — features/F17_Messages_and_Inbox.md
- F18 Notifications (P1) — features/F18_Notifications.md
- F19 Reporting and Blocking (P0) — features/F19_Reporting_and_Blocking.md
- F20 Admin Portal and Moderation (P0) — features/F20_Admin_Portal_and_Moderation.md
- F21 Completion and Ratings (P1) — features/F21_Completion_and_Ratings.md
- F23 Privacy and Account Requests (P1 automation; P0 manual process) — features/F23_Privacy_and_Account_Requests.md
