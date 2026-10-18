# Security rules, validation and acceptance testing
## Rule policy to implement, not a ready-to-deploy rules file
Default deny. Firebase Auth email verification and users/{uid}.accountStatus == active are checked on protected reads. Campus content requires verificationStatus == verified and matching campusId. users role/status and publicProfiles projection are not student-writable. Both admin claim and current protected role/status are required for admin routes and callables, allowing immediate suspension even with a cached token.

| Resource | Allowed browser reads | Allowed browser writes |
| --- | --- | --- |
| users | self; admin | none; callable only |
| publicProfiles | verified same-campus; own profile | none |
| campuses | verified members of matching campus; onboarding gets own campus display through fixed app configuration | none |
| listings | same-campus verified and active/reserved; owner history; admin | none |
| rides | same-campus verified; own historical offers; admin | none |
| rideRequests | named passenger or driver; admin | none |
| conversations, messages, readStates | current active verified participants only | none |
| saved, blocks, notifications, pushTokens | owning active user | none |
| verificationRequests, privacyRequests | self; admin | none |
| deals | participants; admin | none |
| reviews | visible same-campus; author; admin | none |
| reports | reporter may read own report; admin | none |
| operations | none | none |
| auditLogs | admin | none |

All writes above go through validated callables using Admin SDK. Build Firestore rules as a reviewed implementation of this matrix; this handbook intentionally does not ship a permissive production rules file. Reports must not embed private investigation notes in a reporter-readable document: keep internal evidence/notes in a separate admin-only subcollection.

Storage rules restrict upload by uid path, active verified account, MIME allowlist and file size. Only authorized same-campus members may download approved listing images. Owner/admin can remove authorized files. When consulting Firestore from Storage rules, account for cross-service permission setup. Validate upload references in server functions; a path string is not proof of ownership. Serve images as images and reject SVG/HTML uploads.

## Server validation defaults
Name 2–60 characters; title 3–100; description 10–2000; category enum books/electronics/furniture/hostel/bicycles/other; condition new/like-new/good/fair. At most five images. Ride notes maximum 500; message maximum 2000; report details maximum 2000; review text maximum 500. Unknown input fields rejected. Escape user text through normal React rendering; never inject raw HTML. Use server-side length, type, enum and date checks even if forms already validate them. Do not log private messages, passwords or tokens.

## Required automated tests
| ID | Scenario | Expected result | Owner |
| --- | --- | --- | --- |
| T01 | Unauthenticated user reads campus feed | Denied | 2 |
| T02 | Student alters role/status/campus directly | Denied | 2 |
| T03 | Verified member queries another campus | Denied | 2 |
| T04 | Student B updates Student A listing | Denied | 1 |
| T05 | Donation has price > 0; sale has null/negative price | Rejected | 1 |
| T06 | Duplicate create action with same key | One listing | 1 |
| T07 | Oversize or disguised forbidden image upload | Rejected; server rejects invalid object reference | 2 + 1 |
| T08 | Two concurrent acceptance calls compete for one ride's final seat | Exactly one request accepted, zero seats left | 3 |
| T09 | Repeat accept or cancel after a retry | No second decrement/increment | 3 |
| T10 | Passenger requests own/past/cancelled ride | Rejected | 3 |
| T11 | Cancel parent while accept is in progress | No accepted booking can remain effectively active on cancelled ride | 3 |
| T12 | Stranger reads messages or forges participant IDs | Denied | 2 |
| T13 | Block either direction, then send message/request | Denied | 2 + 3 |
| T14 | Suspend user with existing login session | Protected reads/writes denied without waiting for token expiry | 2 |
| T15 | Participant submits duplicate or unrelated review | Rejected | 2 |
| T16 | Update with stale expectedUpdatedAt | Conflict shown; no silent overwrite | 1 + 3 |
| T17 | Pending member approves own verification | Denied | 2 |
| T18 | Admin closes report without reason | Rejected and no incomplete audit record | 2 |

Use Firebase Emulator Suite for Auth/Firestore/Functions/Storage tests and @firebase/rules-unit-testing for rules. Run concurrent acceptance test through the server API, not just a mocked button. Use Vitest for pure validation/state-transition logic and Playwright for browser workflows. Write the test scripts in package.json; they are not supplied as a completed application here.

## Manual release tests
Two different accounts in separate browser profiles or phones. Refresh nested routes. Test 360px and desktop. Tab through forms and confirm visible focus and labelled errors. Disconnect during upload/message/request, retry, confirm no duplicates. Check expired sessions. Test denied notification/location permissions. Review network bundle for server secrets. Confirm production does not use emulators or fixtures. Staging index behaviour must be tested against real Firestore, since emulator behaviour is not a complete substitute.

## Privacy and ride pilot boundaries
Do not expose student email, phone or exact home address in campus feeds. Use designated public pickup points. Verification is not a safety guarantee. Provide report/block and clear cost-sharing language. Before real-world rides, the team should establish applicable operational requirements and a human incident contact; this document is not a legal assessment. Start with invited adult testers and no in-app payments. Define a written retention/deletion policy with the institution before retaining real student data.
