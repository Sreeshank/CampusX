# API and service contract
## Transport
These are proposed Firebase callable function names, not already deployed endpoints. Call through httpsCallable(functions, name); do not treat them as arbitrary REST URLs. Firebase carries authentication context. Person 2 exports platform functions; Persons 1 and 3 export module functions through the shared functions entrypoint. Authentication signup/login/password reset/email verification/logout use Firebase Auth SDK directly, not custom password APIs.

## Common contract
Inputs use JSON; IDs are opaque strings; dates are UTC ISO strings; money is integer paise. All business functions require authenticated, active, email-verified, campus-verified users except bootstrapProfile/updateProfile/submitVerification and admin-authorized actions. Pending students may only manage their own onboarding/profile. Admin functions require both the trusted admin claim and protected current account role/status.
Return the exact typed result through the callable response data. Errors use HttpsError codes: unauthenticated, permission-denied, invalid-argument, not-found, already-exists, failed-precondition, resource-exhausted, aborted, internal. Present a friendly UI message; never reveal tokens or private records. Do not turn permission-denied into “not found” on every screen if that hides onboarding requirements.
For creation/message/booking operations require a UUID idempotencyKey. Store uid+key with payload hash and result in operations; reuse returns prior result, a different payload with same key fails. Enforce rates per uid server-side. This record supplements business uniqueness constraints, not replaces them. Read all transactional documents before writes. Transaction callback may run again; no email/push/network side effects inside it.

## Mutation catalogue
| Function | Owner | Input | Output | Authorization and behaviour |
| --- | --- | --- | --- | --- |
| bootstrapProfile | 2 | {displayName,campusId} | {uid,verificationStatus} | Signed-in caller; create own pending student profile once; existing profile returned unchanged. |
| updateProfile | 2 | {displayName,department?,year?,avatarPath?} | {profile} | Self; allowlist fields; never accept role/status/campus/email from this payload. |
| submitVerification | 2 | {campusId} | {status:"pending"} | Verified Auth email; one pending request per uid; admin checks roster offline. |
| reviewVerification | 2 | {uid,decision:"approve" / "reject",reason} | {status} | Admin; update request, protected account and public projection atomically; audit. |
| createListing | 1 | {title,description,category,condition,mode,pricePaise,swapWanted?,imagePaths,idempotencyKey} | {listingId} | Verified same-campus user; server sets owner and campus; validate mode and uploads. |
| updateListing | 1 | {listingId,patch,expectedUpdatedAt} | {listingId,updatedAt} | Owner of active/reserved item; allowlist content fields; stale edits fail; removed items immutable. |
| setListingStatus | 1 | {listingId,status,expectedUpdatedAt} | {status} | Owner; permitted transitions only; no owner removal reversal; soft delete uses withdrawn. |
| setSavedListing | 2 | {listingId,saved:boolean} | {saved} | Self; require visible same-campus listing when saving; deletion allowed for stale saved item. |
| proposeDeal | 1 | {listingId,buyerId,idempotencyKey} | {dealId} | Owner; buyer must be verified same-campus user with existing listing conversation; no self-deal. |
| confirmDeal | 1 | {dealId,confirm:boolean} | {status} | Participant; false cancels proposed deal; both confirmations complete listing atomically; one confirmed deal per listing. |
| createRide | 3 | {pickupPointId,destinationPointId,departureAt,seatsTotal,costSharePaise,vehicleType,notes,idempotencyKey} | {rideId} | Verified; server resolves labels; future UTC time; different points; integral seats 1..6; twoWheeler maximum 1 passenger. |
| updateRide | 3 | {rideId,patch,expectedUpdatedAt} | {rideId,updatedAt} | Driver before departure; no route/time/cost/capacity edit while any accepted passenger exists. |
| requestRide | 3 | {rideId,idempotencyKey} | {requestId,status} | Passenger differs from driver; open future ride, seats available, no block; one fixed rideId_uid request; one seat only. |
| respondToRideRequest | 3 | {requestId,decision:"accept" / "reject",idempotencyKey} | {status,seatsAvailable} | Driver only; atomic read/check/write of ride and request; accepted decrements by one. |
| cancelRideRequest | 3 | {requestId,idempotencyKey} | {status,seatsAvailable} | Requesting passenger only, before departure; accepted releases one seat once; pending releases none. |
| cancelRide | 3 | {rideId,reason,idempotencyKey} | {status:"cancelled"} | Driver before departure or admin; atomically close parent; retry-safe fanout cancels children and sends notices. |
| completeRide | 3 | {rideId} | {status:"completed"} | Driver after departure; no future or cancelled ride completion; retain participant request records. |
| openConversation | 2 | {contextType:"listing" / "ride",contextId,otherUserId} | {conversationId} | Server validates counterpart is owner/driver or a ride requester; same-campus, active, no block; stable pair/context key. |
| sendMessage | 2 | {conversationId,text,idempotencyKey} | {messageId,createdAt} | Active verified participant; no block either direction; text 1..2000; server sets sender/time; rate limit. |
| markConversationRead | 2 | {conversationId} | {lastReadAt} | Participant; server timestamp on own read marker only. |
| submitReport | 2 | {targetType,targetId,conversationId?,reason,details,idempotencyKey} | {reportId} | Verified caller; validate target access; message reports must prove conversation membership. |
| setUserBlock | 2 | {targetUid,blocked:boolean} | {blocked} | Self block list only; cannot block self; stops new messages, conversations and requests in either direction. |
| getReportEvidence | 2 | {reportId} | {report,evidence} | Admin only; fetch only target and minimum related evidence; record audited access; do not expose an unrestricted conversation query. |
| reviewReport | 2 | {reportId,decision,reason} | {status} | Admin; decisions reviewing/resolve/dismiss; audit, minimal evidence; separate moderation action below. |
| moderateEntity | 2 | {targetType:"listing" / "ride" / "user",targetId,action,reason} | {status} | Admin; listing remove, ride cancel, user suspend/restore; audit; cannot grant admin or suspend final active admin. |
| markNotificationRead | 2 | {notificationId} | {readAt} | Own notification only; idempotent marker. |
| submitReview | 2 | {contextType:"deal" / "ride",contextId,revieweeId,stars,text} | {reviewId} | P1; confirmed deal or completed ride plus accepted request; related distinct participants; one review per context/direction; server aggregate. |
| registerPushToken | 2 | {token} | {registered:true} | P1; current account only; pair to device; remove on logout or invalid-delivery response. |
| removePushToken | 2 | {token} | {removed:true} | P1; own token registration only. |
| requestPrivacyAction | 2 | {type:"export" / "delete"} | {requestId,status} | P1; self; reauthentication for deletion; request is queued, not instant irreversible erasure. |

## Read adapters (frontend service functions)
| Adapter | Query / result | Owner |
| --- | --- | --- |
| watchCurrentUser | own users/{uid} and Auth state; cleanup on logout | 2 |
| listListings(filters,cursor) | page of visible listings, nextCursor; modes and query combinations per database doc | 1 |
| getListing(id) | one permitted listing or typed unavailable error | 1 |
| listMyListings(cursor) | ownerId == uid, createdAt descending | 1 |
| listSavedListings(cursor) | own saved refs; fetch only permitted targets and handle removed items | 1 |
| listRides(filters,cursor) | campus + route points + UTC departure range; page and nextCursor | 3 |
| watchRide(id) | permitted ride; live status and seat count | 3 |
| listMyRideRequests(cursor) | passengerId == uid; resolve parent status before showing effective request state | 3 |
| listDriverRequests(rideId,cursor) | driverId == uid and rideId | 3 |
| watchConversations | participantIds array-contains uid, bounded results | 2 |
| watchMessages(conversationId,cursor) | membership-checked messages; latest 30, paginate older history | 2 |
| listAdminReports(status,cursor) | admin-only bounded query | 2 |

## Example browser invocation
```typescript
const accept = httpsCallable<
  {requestId: string; decision: 'accept' | 'reject'; idempotencyKey: string},
  {status: string; seatsAvailable: number}
>(functions, 'respondToRideRequest');
const result = await accept({requestId, decision: 'accept', idempotencyKey});
```
Create the retry key once when starting the user action; retain it across retry. Imports and functions initialization are in templates/firebase-client.example.ts. This snippet is not a complete component.

## Required acceptance transaction (algorithm, not deployed code)
Read operation receipt, request, parent ride, driver account, passenger account and relevant block records. If matching receipt exists, return it. Verify driver identity, both accounts eligible, request pending, ride open and future, no block, and at least one seat. Write request accepted and decrement seatsAvailable together. Write operation receipt and notification/outbox event in the same transaction. Send optional push after commit using a deduplicated event worker. If request already accepted, return its state without decrementing again. A competing accept for the last seat must fail cleanly. Rejection changes only pending status and does not change seat availability.

Cancellation reads the same invariants; only accepted → cancelled releases capacity, and no retry may release twice. A cancelled parent ride stays closed regardless of remaining seat number. Request creation uses a stable rideId_uid ID and rejects duplicate terminal requests in v1. Admin account suspension immediately blocks new API activity and data reads; moderator also closes owned active listings/rides and informs affected participants using retry-safe jobs.
