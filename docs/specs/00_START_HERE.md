# CampusX — Team Implementation Handbook
Version 1.0 • 18 October 2026 • Browser-based prototype • KITS Warangal

## What this ZIP contains
Three individual assignment guides, shared architecture and setup instructions, a database specification, an API contract, a security/test plan, and separate specifications for every planned feature. Read the HTML versions in any browser or edit the Markdown versions in VS Code. START_HERE.html is the offline contents page. No internet is required to read the pack; official source links require internet.

This is an implementation specification, not a finished application. Configuration snippets are examples to integrate and test. No live credentials, Firebase project, deployed API, or verified college partnership is supplied. All names and amounts in examples are fictional test data.

## Agreed direction
One responsive website; two permission-based portals: student and admin. XChange and XRide are modules inside the student portal. A student can be a buyer, seller, ride driver, or passenger using the same account. Start at KITS Warangal; further campuses are future scope.

## Read in this order
1. Your guide in people/.
2. shared/01_ARCHITECTURE.md and shared/02_SETUP_AND_KEYS.md.
3. shared/03_DATABASE.md and shared/04_API_CONTRACT.md.
4. Your assigned files in features/.
5. shared/05_SECURITY_AND_TESTS.md before integration or deployment.

## Ownership
| Person | Primary ownership | Shared duty |
| --- | --- | --- |
| 1 — leader | Home, design system, XChange UI and XChange server functions | Reviews work, integrates releases, owns task board |
| 2 | Accounts, profiles, admin, Firebase infrastructure, chat and notification services | Defines security patterns and reviews every server function |
| 3 | XRide UI and XRide server functions | Integration test coordinator; later map feature |

Person 2 does not write the entire backend. Persons 1 and 3 implement the server-side business logic for their modules using Person 2's authentication, validation and authorization helpers.

## Delivery stages
P0 — functioning prototype: authentication, manual campus verification, profiles, Home, marketplace create/browse/manage/detail, four listing modes, basic text messaging, ride offers/search/requests/history, reporting, blocking, basic moderation, data permissions, responsive UI and deployment.
P1 — pilot improvements: saved items, basic in-app notifications, confirmed-outcome reviews, map display, browser push, privacy/export/deletion workflow. Complete a basic manual privacy-request process before inviting real users, even if automation comes later.
P2 — optional product/business expansion: payments, commissions, promoted listings, advertising, subscriptions, referrals, analytics dashboards and multi-campus rollout. These are documented separately; do not silently include them in the first deadline.

## Suggested milestones
Days 1–2: agree contracts, choose campus verification process, create repository, emulator setup and shared components.
Week 1: authentication, navigation and mock-data screens; server helpers available to all.
Week 2: working marketplace, messaging and basic ride creation/search.
Week 3: ride state machine, administration, reports and permission tests.
Week 4: two-device tests, accessibility checks, bug fixes and small invited pilot.
This is an estimate for developers with basic React/TypeScript skills, not a guaranteed delivery time. Stage P1 after P0 is stable.

## Definition of done
UI handles loading, empty results, invalid inputs, denied access, network errors and success. Server validates inputs and ownership. Relevant automated tests pass. Another teammate reviews the change. Feature works on mobile and desktop in the shared environment. No mock data is represented as a real user or completed transaction.

## First demonstration
Student A signs in and is approved for the campus. A posts a textbook. Student B finds it and sends a message. A offers a ride. B requests one seat. A accepts. Both devices show the same updated state. An unrelated Student C cannot read their private conversation.
