# F17 — Messages and Inbox
## Owner and stage
Person 2 • P0
Routes: /messages; /messages/:conversationId
## User goal
Enable private text coordination for listings and rides.
## Frontend work
Inbox ordered by activity; context label; latest messages with timestamps; composer, sending/retry and unread markers; report/block controls.
## Backend work
openConversation derives pair/context key after checking relationship; sendMessage verifies participant, active account and either-direction blocks. Create server timestamp and update conversation. No attachments in P0.
## APIs and data
openConversation; sendMessage; markConversationRead; conversations/messages/readStates
Exact payloads and authorization are defined in shared/04_API_CONTRACT.md; canonical fields are in shared/03_DATABASE.md. Use those names rather than inventing competing schemas.
## Validation and edge cases
Text 1–2000; rate limit; never allow client-chosen membership. Ride thread counterpart must be relevant requester/driver. Existing archived thread may be read by participants; new messages require eligible accounts and no block.
## Acceptance tests
Third account cannot read thread; retry creates one message; escaped HTML remains text; logout unsubscribes.
## Dependencies and handoff
F01–F02; F08/F14 entry points; F19.
Provide a short demonstration, one failure/unauthorized case and the reviewed pull request. All implementation remains proposed until that evidence exists. See shared/05_SECURITY_AND_TESTS.md for cross-feature checks.
