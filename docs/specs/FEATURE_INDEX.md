# Feature ownership and scope index

| Feature | Person | Stage | Routes |
| --- | --- | --- | --- |
| F01 Authentication | 2 | P0 | /login, /register, /forgot-password |
| F02 Campus Verification | 2 | P0 | /verify; /admin/verifications |
| F03 Student Profile | 2 | P0 | /profile |
| F04 Home and Navigation | 1 | P0 | /home |
| F05 Marketplace Search and Filters | 1 | P0 | /xchange |
| F06 Create and Edit Listings | 1 | P0 | /xchange/new; /xchange/:listingId/edit |
| F07 Image Uploads | 2 | P0 | Shared listing/avatar upload component |
| F08 Product Details and Contact | 1 | P0 | /xchange/:listingId |
| F09 Sale Swap and Donation | 1 | P0 | Listing form and product details |
| F10 My Listings and Status | 1 | P0 | /my-listings |
| F11 Saved Items | 1 | P1 | /saved |
| F12 Offer and Edit Rides | 3 | P0 | /xride/new; /my-rides |
| F13 Find Rides | 3 | P0 | /xride |
| F14 Ride Details and Seat Request | 3 | P0 | /xride/:rideId |
| F15 Driver Request Management | 3 | P0 | /my-rides → offer → requests |
| F16 Ride Cancellation and History | 3 | P0 | /my-rides |
| F17 Messages and Inbox | 2 | P0 | /messages; /messages/:conversationId |
| F18 Notifications | 2 | P1 | /notifications and optional browser permission prompt |
| F19 Reporting and Blocking | 2 | P0 | Shared report dialogs; profile block controls |
| F20 Admin Portal and Moderation | 2 | P0 | /admin and subroutes |
| F21 Completion and Ratings | 2 | P1 | Post-completion review dialog; public profile |
| F22 Map Display and Location | 3 | P1 | Ride details; optional pickup selection |
| F23 Privacy and Account Requests | 2 | P1 automation; P0 manual process | /profile → privacy |
| F24 Responsive Web and Deployment | 1 | P0 | All routes |
| F25 Future Business Features | 1 | P2 — not first prototype | Future admin and student settings |

Person 1 reviews all UI integration; Person 2 reviews all authorization and data-rule changes; Person 3 coordinates two-account ride and integration tests. P1/P2 remain documented backlog, not prerequisites for calling the P0 demonstration complete.
