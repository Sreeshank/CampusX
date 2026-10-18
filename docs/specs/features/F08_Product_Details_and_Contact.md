# F08 — Product Details and Contact
## Owner and stage
Person 1 • P0
Routes: /xchange/:listingId
## User goal
Let a student assess an item and contact its owner.
## Frontend work
Gallery, title, price/mode, condition, description, public seller card, report and Message Seller actions. Own listing shows manage actions.
## Backend work
getListing checks current visibility. openConversation validates active listing and counterpart owner; navigates to returned conversation. Public seller info comes from publicProfiles.
## APIs and data
getListing; openConversation; publicProfiles
Exact payloads and authorization are defined in shared/04_API_CONTRACT.md; canonical fields are in shared/03_DATABASE.md. Use those names rather than inventing competing schemas.
## Validation and edge cases
Do not expose seller email/phone. Removed/unavailable items show a clear status. Cannot contact self; blocked counterparts cannot open new conversation.
## Acceptance tests
Buyer reaches correct seller thread; withdrawn listing has no new contact action; unknown ID shows safe unavailable page.
## Dependencies and handoff
F05–F06; F17 messaging; F19 reporting/blocking.
Provide a short demonstration, one failure/unauthorized case and the reviewed pull request. All implementation remains proposed until that evidence exists. See shared/05_SECURITY_AND_TESTS.md for cross-feature checks.
