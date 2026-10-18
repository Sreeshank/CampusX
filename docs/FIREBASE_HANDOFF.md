# Connecting the real backend

The original shared setup/key guide is in `docs/specs/shared/02_SETUP_AND_KEYS.md`. No real credentials are supplied. Firebase Storage and deployed Functions may require billing; begin with emulators.

## Sequence

1. Person 2 creates the development Firebase Web app, enables Auth and chooses the database/Functions regions. Copy `.env.example` to `.env.local` and fill public config values. Never place a service-account secret in VITE\_\*.
2. Install the functions dependencies. Use Node 22 for Functions; compile them with `npm run functions:build`.
3. Configure Firebase CLI project aliases locally; no production project ID is hard-coded here. Start Auth/Firestore/Functions/Storage emulators. See `firebase.json` for ports.
4. Implement real Auth provider and protected account documents. Establish manual campus approval and a trusted first-admin procedure.
5. Implement authorization helpers, safe public profiles, Firestore/Storage rules, and emulator denial tests. The shipped rules deny all access by design.
6. Persons 1 and 3 replace their Cloud Function stubs with input validation, caller ownership/campus checks and idempotent writes. Ride seat changes require transactions; never just copy the local array mutations.
7. Build async frontend adapters and read subscriptions with pagination. Wire pages to a provider; replace every demo-store import. Translate Firebase Timestamp to ISO strings at the adapter boundary.
8. Remove the `VITE_DATA_MODE=firebase` blocker only after live adapter, errors, roles, rules and transactions pass tests. Keep the demo account selector entirely out of live mode.
9. Test two actual accounts on separate devices in a development environment. Review staged indexes. Then build and deploy the configured development Hosting target manually.

## Local convenience methods → actual callables

| Local method                            | Required live contract                                                                |
| --------------------------------------- | ------------------------------------------------------------------------------------- |
| switchUser                              | Replace entirely with Auth sign-in/sign-out; never an impersonation endpoint          |
| createListing(input)                    | createListing(input), same required fields; real Storage object paths                 |
| updateListing(id,input,expected)        | updateListing({listingId,patch,expectedUpdatedAt}); no create-only retry key in patch |
| setListingStatus(id,status)             | setListingStatus({listingId,status,expectedUpdatedAt})                                |
| saveListing(id)                         | setSavedListing({listingId,saved})                                                    |
| saveImage(dataUrl)                      | Storage upload adapter; owned object paths and validated type/size                    |
| requestRide(id,key)                     | requestRide({rideId,idempotencyKey:key})                                              |
| respondToRideRequest(id,decision,key)   | respondToRideRequest({requestId,decision,idempotencyKey:key})                         |
| cancelRideRequest(id,key)               | cancelRideRequest({requestId,idempotencyKey:key})                                     |
| cancelRide(id)                          | cancelRide({rideId,reason,idempotencyKey})                                            |
| openConversation(type,id,user)          | openConversation({contextType,contextId,otherUserId})                                 |
| sendMessage(id,text,key)                | sendMessage({conversationId,text,idempotencyKey:key})                                 |
| submitReport(type,id,reason)            | submitReport({targetType,targetId,reason,details,idempotencyKey})                     |
| setUserBlock(uid)                       | setUserBlock({targetUid,blocked})                                                     |
| resolveReport(id,reason,remove)         | Separate reviewReport and moderateEntity calls with audit/ownership rules             |
| reviewVerification(uid,decision,reason) | reviewVerification({uid,decision,reason})                                             |

The original API specification is authoritative. New live features must use its status values, required parameters and permissions. Do not expose a raw DemoState snapshot from a server; read only records the caller is authorized to access.
