# F09 — Sale Swap and Donation
## Owner and stage
Person 1 • P0
Routes: Listing form and product details
## User goal
Support four user actions using three listing modes.
## Frontend work
Buy is the action for sale listings; Sell creates sale; Swap displays requested exchange; Donate displays Free. Explain arrangements happen in chat.
## Backend work
Enforce mode/price invariants in create/update. Store swapWanted for swap. Completion labels depend on mode. No payment or auto-matching integration in P0.
## APIs and data
createListing; updateListing; setListingStatus
Exact payloads and authorization are defined in shared/04_API_CONTRACT.md; canonical fields are in shared/03_DATABASE.md. Use those names rather than inventing competing schemas.
## Validation and edge cases
Prevent sale at null price, donation with nonzero price, swap without wanted item. Do not mark payment received merely because a chat starts.
## Acceptance tests
Create one item in each mode, filter each and display correct button/price; completion shows Sold/Swapped/Donated.
## Dependencies and handoff
F06 and F08.
Provide a short demonstration, one failure/unauthorized case and the reviewed pull request. All implementation remains proposed until that evidence exists. See shared/05_SECURITY_AND_TESTS.md for cross-feature checks.
