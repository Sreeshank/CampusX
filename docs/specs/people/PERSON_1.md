# Person 1 — Team Leader — Home and XChange
## Your outcome
Own the responsive app shell and all marketplace journeys, including the listing server functions. Coordinate integration without becoming the sole developer or tester.
## Tools to use
React + TypeScript + Vite for browser screens; React Router for navigation; CSS for shared styling; Firebase modular Web SDK for authentication and authorized reads; TypeScript Cloud Functions for trusted writes; Vitest and Firebase Emulator Suite for meaningful unit/permission tests; Playwright for browser flows. Use VS Code and one shared Git repository.
## Your owned folders
src/app/, src/components/, src/features/home/, src/features/xchange/, functions/src/xchange/
These are proposed application paths, not files already implemented in this documentation ZIP.
## Work sequence
Build the navigation and reusable UI first; then listing feed and details with typed fixtures; then create/edit forms and image uploads; then server mutations and search; finally chat/report entry points and integration.
## Frontend responsibilities
Use the shared buttons, fields, cards and status components. Follow the exact shared TypeScript field names and callable contracts. Every screen includes loading, empty, error and disabled-submit states. Preserve form input after failure. Route guards improve UX; server checks provide security. Test a 360px-wide phone layout and a desktop layout.
## Backend responsibilities
Use the authentication and campus helpers defined by Person 2. Derive uid from the verified callable context; never trust a submitted ownerId or role. Validate each field again server-side. Use server timestamps, integer paise for money, cursor pagination and deterministic retry keys. Do not write another member’s function files without agreeing first.
## Keys and configuration
Read shared/02_SETUP_AND_KEYS.md. All three use the same development project’s public Firebase web configuration in their own .env.local files. No member needs a personal OpenAI API key to run CampusX. Never put an Admin SDK credential in frontend files. Person 2 manages platform configuration, but every member signs into development tools using their own authorized account.
## Dependencies and handoff
All members agree shared types, route names, campusId and error codes before coding. Request changes through a pull request with an example input/output. Persons 1 and 3 may use mock adapters while Person 2 finishes shared functions; mocks must return exactly the agreed shapes and be disabled in the deployed app.
## Acceptance checklist
Create sale, swap and donation examples; reject invalid prices; prevent editing another user’s item; refresh a nested URL successfully; test photo upload failure; verify sold items cannot start new purchase conversations.
## Daily update to the leader
Completed: issue IDs and demo. Next: one small task. Blocked: exact error and the owner needed. Include no credentials in screenshots or logs.
## AI-assisted implementation prompt
“Implement one assigned CampusX feature using its feature specification and the shared architecture, database and API contract. Stay inside my owned files. Show validation and access checks. Add tests for failure and unauthorized access. Do not invent credentials, claim tests passed without running them, or change shared contracts silently.”
## Definition of handoff
Open a reviewed pull request with screen screenshots, changed API/schema details, tests actually run, remaining issues, and a short two-account demonstration. Do not send copied project folders or overwrite another person’s working tree.

## Assigned feature specifications
- F04 Home and Navigation (P0) — features/F04_Home_and_Navigation.md
- F05 Marketplace Search and Filters (P0) — features/F05_Marketplace_Search_and_Filters.md
- F06 Create and Edit Listings (P0) — features/F06_Create_and_Edit_Listings.md
- F08 Product Details and Contact (P0) — features/F08_Product_Details_and_Contact.md
- F09 Sale Swap and Donation (P0) — features/F09_Sale_Swap_and_Donation.md
- F10 My Listings and Status (P0) — features/F10_My_Listings_and_Status.md
- F11 Saved Items (P1) — features/F11_Saved_Items.md
- F24 Responsive Web and Deployment (P0) — features/F24_Responsive_Web_and_Deployment.md
- F25 Future Business Features (P2 — not first prototype) — features/F25_Future_Business_Features.md

Additional shared ownership: implement proposeDeal/confirmDeal and the confirmation UI for F21. Add report/chat actions to marketplace screens; Person 2 owns their shared APIs.
