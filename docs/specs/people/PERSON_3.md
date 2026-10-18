# Person 3 — XRide and Integration
## Your outcome
Own the complete scheduled cost-sharing ride workflow, frontend and backend. Coordinate cross-device checks with the leader.
## Tools to use
React + TypeScript + Vite for browser screens; React Router for navigation; CSS for shared styling; Firebase modular Web SDK for authentication and authorized reads; TypeScript Cloud Functions for trusted writes; Vitest and Firebase Emulator Suite for meaningful unit/permission tests; Playwright for browser flows. Use VS Code and one shared Git repository.
## Your owned folders
src/features/xride/, functions/src/xride/, src/features/maps/, tests/e2e/xride/
These are proposed application paths, not files already implemented in this documentation ZIP.
## Work sequence
Build forms and route search with fixtures; create ride functions; implement requests and driver management; implement atomic acceptance/cancellation; integrate shared messaging/reporting; add history; only then implement optional map display.
## Frontend responsibilities
Use the shared buttons, fields, cards and status components. Follow the exact shared TypeScript field names and callable contracts. Every screen includes loading, empty, error and disabled-submit states. Preserve form input after failure. Route guards improve UX; server checks provide security. Test a 360px-wide phone layout and a desktop layout.
## Backend responsibilities
Use the authentication and campus helpers defined by Person 2. Derive uid from the verified callable context; never trust a submitted ownerId or role. Validate each field again server-side. Use server timestamps, integer paise for money, cursor pagination and deterministic retry keys. Do not write another member’s function files without agreeing first.
## Keys and configuration
Read shared/02_SETUP_AND_KEYS.md. All three use the same development project’s public Firebase web configuration in their own .env.local files. No member needs a personal OpenAI API key to run CampusX. Never put an Admin SDK credential in frontend files. Person 2 manages platform configuration, but every member signs into development tools using their own authorized account.
## Dependencies and handoff
All members agree shared types, route names, campusId and error codes before coding. Request changes through a pull request with an example input/output. Persons 1 and 3 may use mock adapters while Person 2 finishes shared functions; mocks must return exactly the agreed shapes and be disabled in the deployed app.
## Acceptance checklist
Two simultaneous accept operations cannot overbook; duplicate clicks do not reserve twice; cancellation releases a seat exactly once; driver cannot request their own ride; past/full/cancelled rides reject new requests; other campuses cannot read rides.
## Daily update to the leader
Completed: issue IDs and demo. Next: one small task. Blocked: exact error and the owner needed. Include no credentials in screenshots or logs.
## AI-assisted implementation prompt
“Implement one assigned CampusX feature using its feature specification and the shared architecture, database and API contract. Stay inside my owned files. Show validation and access checks. Add tests for failure and unauthorized access. Do not invent credentials, claim tests passed without running them, or change shared contracts silently.”
## Definition of handoff
Open a reviewed pull request with screen screenshots, changed API/schema details, tests actually run, remaining issues, and a short two-account demonstration. Do not send copied project folders or overwrite another person’s working tree.

## Assigned feature specifications
- F12 Offer and Edit Rides (P0) — features/F12_Offer_and_Edit_Rides.md
- F13 Find Rides (P0) — features/F13_Find_Rides.md
- F14 Ride Details and Seat Request (P0) — features/F14_Ride_Details_and_Seat_Request.md
- F15 Driver Request Management (P0) — features/F15_Driver_Request_Management.md
- F16 Ride Cancellation and History (P0) — features/F16_Ride_Cancellation_and_History.md
- F22 Map Display and Location (P1) — features/F22_Map_Display_and_Location.md

Additional shared ownership: add chat/report actions to ride screens; supply completion context for reviews; implement notification events for ride transitions using Person 2’s adapter.
