# Database contract
## Universal conventions
Firestore document IDs are opaque strings. Server sets createdAt/updatedAt as Timestamp. APIs return ISO 8601 UTC strings. campusId is initially kits-warangal, a project-internal identifier and not a verified institution partnership. Reject arbitrary campus changes. Money is integer paise; departureAt is a UTC Timestamp displayed in Asia/Kolkata. No passwords are stored in Firestore.

## Collections
| Path | Required fields and types | Access/write owner |
| --- | --- | --- |
| users/{uid} | displayName:string, email:string, campusId:string, verificationStatus:pending/verified/rejected, role:student/admin, accountStatus:active/suspended/deletionRequested, createdAt, updatedAt | Self/admin read; platform functions write; email never in public feed |
| publicProfiles/{uid} | displayName, campusId, department?, year?, avatarPath?, verificationStatus, ratingCount:number, ratingSum:number | Same-campus verified readers; platform-generated safe projection |
| verificationRequests/{uid} | campusId, method:manualRoster, status:pending/approved/rejected, submittedAt, reviewedAt?, reviewedBy?, reason? | Self/admin; functions only |
| campuses/{campusId} | name, active:boolean, approvedEmailDomains:string[], allowedPickupPoints:array | Verified members read; trusted admin config; domains empty until confirmed |
| listings/{id} | ownerId, campusId, title, titleNormalized, description, category, condition, mode:sale/swap/donation, pricePaise:number or null, swapWanted?:string, imagePaths:string[], status:active/reserved/completed/withdrawn/removed, createdAt, updatedAt | Same-campus active feed, owner history, admin; XChange functions |
| users/{uid}/saved/{listingId} | listingId, createdAt | Self only; saved service |
| deals/{id} | listingId, sellerId, buyerId, campusId, mode, status:proposed/confirmed/cancelled, sellerConfirmed:boolean, buyerConfirmed:boolean, createdAt, completedAt? | Participants/admin; XChange functions; P1 reviews dependency |
| rides/{id} | driverId, campusId, pickupPointId, destinationPointId, pickupLabel, destinationLabel, departureAt, seatsTotal:int, seatsAvailable:int, costSharePaise:int, vehicleType:bicycle/car/twoWheeler/other, notes, status:open/cancelled/completed, createdAt, updatedAt | Same-campus members; XRide functions |
| rideRequests/{rideId_uid} | rideId, passengerId, driverId, campusId, seatsRequested:1, status:pending/accepted/rejected/cancelled, createdAt, updatedAt | Passenger or driver/admin; XRide functions |
| conversations/{id} | campusId, participantIds:two uids, contextType:listing/ride, contextId, createdAt, updatedAt | Participants only; admin access only through audited report investigation |
| conversations/{id}/messages/{id} | senderId, text, createdAt | Participants; messaging function only |
| conversations/{id}/readStates/{uid} | lastReadAt | Participant's own marker |
| users/{uid}/notifications/{id} | type, entityType, entityId, title, createdAt, readAt? | Recipient only; server creates, read marker via callable |
| reports/{id} | reporterId, targetType:listing/ride/user/message, targetId, conversationId?, reason, details, campusId, status:open/reviewing/resolved/dismissed, createdAt, reviewedBy?, resolution? | Reporter read safe receipt; admin review; functions |
| users/{uid}/blocks/{blockedUid} | createdAt | Self; server checks either direction |
| reviews/{dealOrRideId_reviewerId_revieweeId} | contextType:deal/ride, contextId, reviewerId, revieweeId, campusId, stars:1..5, text, status:visible/hidden, createdAt | Same campus reads visible; server verifies participation |
| auditLogs/{id} | actorId, action, targetType, targetId, reason, createdAt | Admin read only; server append only |
| operations/{uid_key} | operation, payloadHash, result, createdAt, expiresAt | Server only; idempotency receipt |
| users/{uid}/pushTokens/{id} | token, createdAt, lastSeenAt | Self registration via function; server send only; P1 |
| privacyRequests/{id} | uid, type:export/delete, status:pending/processing/completed, createdAt | Self/admin; P1 automation |

## Listing modes
Buying is the buyer's action on a sale listing, not a fourth listing mode. sale requires pricePaise > 0. donation requires pricePaise = 0. swap requires pricePaise = null and nonempty swapWanted. Version 1 coordinates exchanges in chat; no checkout, escrow, automatic swap matching or proof of payment is implied.

## Status and invariants
Listing: active → reserved → completed; reserved → active; active/reserved → withdrawn; moderator may set removed. Owner cannot undo removed. completed/withdrawn are terminal; relist by creating a new listing. Completed sale displays Sold; donation displays Donated; swap displays Swapped. Self-reported completion in P0 is not enough for a verified review in P1.
Ride: open → cancelled before departure, or open → completed after departure. seatsAvailable can reach zero while status remains open; UI shows Full. No reopening terminal rides. With accepted passengers, cancel/recreate to change route, departure or cost. Avoid silent changes after acceptance.
Request: pending → accepted/rejected/cancelled; accepted → cancelled before departure; terminal requests cannot be reactivated in v1. A cancelled parent ride overrides child display state immediately. Driver cancellation updates accepted/pending child requests in retry-safe batches and notifies them; parent transaction blocks all future bookings immediately.

## Query and index plan
Feed: campusId == caller campus, status == active, order createdAt desc, limit 20; optional category/mode. Prefix search: same predicates, titleNormalized >= prefix and < prefix + high sentinel, order titleNormalized then documentId; paginate. Price filter/sort is a separate supported query mode with appropriate pricePaise ordering. Do not promise arbitrary full-text AND every sort combination in v1.
Ride search: campusId/status/pickupPointId/destinationPointId equality, departureAt between selected UTC day boundaries, order departureAt, limit 20. Filter availability only within returned page and continue paging; never claim a globally empty result before exhausting pages.
Own listings: ownerId + createdAt desc. Own offers: driverId + departureAt desc. Requests: passengerId + createdAt desc or driverId + rideId + createdAt desc. Conversations: participantIds array-contains uid + updatedAt desc. Reports: status + createdAt desc. Create indexes for actual query combinations, record them in firestore.indexes.json, and test deployed staging indexes.

## Storage paths
listing-images/{uid}/{uploadId}/{randomFileName}: only that active verified owner uploads JPEG/PNG/WebP, maximum 5 MiB per file, maximum five images referenced by a listing. avatars/{uid}/{fileName}: same formats, maximum 2 MiB. Save object paths, not arbitrary URLs supplied by the client. Function verifies referenced objects exist, belong to caller and meet the expected path/type/size. Use authenticated SDK downloads for campus-only images; avoid public long-lived token URLs if images must remain restricted. Remove abandoned uploads with a scheduled, retry-safe cleanup task after a grace period. Do not collect student ID images for the initial manual approval flow.

## Person 1 implemented module extension

The listing/deal implementation adds optional pendingDealId and confirmedDealId references, server-only xchangeRateLimits records, and read-callable result projections. See ../../PERSON_1_HANDOFF.md for exact shapes, cursor limits, timestamp versions, receipt IDs and the platform integration gate. These additions preserve the original lifecycle and participant permissions.
