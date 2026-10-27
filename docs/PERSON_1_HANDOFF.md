# Person 1 — Home and XChange implementation

This branch implements Person 1's module code. The default application remains a local demo until Person 2 connects real Auth, account guards, uploads, saved items, messaging and reports. No Firebase project was configured or deployed, and no teammate review is implied by this handoff.

## Delivered

- Reference-inspired responsive Home and navigation, with separate member-based live views and no demo account chooser in the live shell.
- Marketplace prefix/category/mode filters, URL retention, sale-price sorting, Load more, My Listings status filtering and saved-item views.
- Sale, swap and donation forms; up to five images, previews/removal, detail gallery, upload failures that preserve the draft, and guarded submission.
- Owner edit/reserve/unreserve/complete/withdraw controls. Terminal statuses cannot reopen; pending handovers block content/lifecycle edits.
- Seller card, message/report entry points and participant-confirmed handovers. A seller can propose to an existing listing contact; both students must confirm to complete. Self-reported completion does not create a confirmed deal or qualify for reviews.
- Actual `createListing`, `updateListing`, `setListingStatus`, `proposeDeal`, `confirmDeal` callables, plus bounded `listListings` and `getListing` read transports.
- Server validation, account/campus/owner checks, owned Storage object metadata validation, transactional stale-write checks, retry receipts, per-user write rate limits and two-party deal transactions.
- Composite index definitions and repeatable Firestore emulator tests, integrated into CI.

## Connect the live views — Person 2

Use the exported `XChangeLiveProvider` inside your real Auth and campus approval guards. The existing `Home`, `Layout`, `Marketplace`, `ListingDetail` and `ListingForm` exports select their live view when this provider exists. Without it they continue to run the explicitly labelled local demo. Do not remove `App.tsx`'s Firebase-mode blocker until the real app-wide provider and guards are ready. XRide and platform routes remain their owners' responsibility.

```tsx
import { XChangeLiveProvider } from '../features/xchange/LiveXChange';
import { createFirebaseXChangeRepository } from '../features/xchange/firebaseRepository';

// These functions and currentMember come from Person 2's real platform code.
// Keep this repository stable with useMemo; recreate it when the account changes.
const repository = createFirebaseXChangeRepository({
  uploadListingImage,
  imageSource,
  setSavedListing,
  listSavedListings,
  openConversation,
  submitReport,
});

<XChangeLiveProvider
  key={currentMember.uid}
  user={{ uid: currentMember.uid, campusId: currentMember.campusId,
    displayName: currentMember.displayName }}
  repository={repository}
  savedIds={savedListingIds}
>
  {/* Your protected student route tree, including Layout and Home. */}
</XChangeLiveProvider>
```

Provider session values choose presentation, not authorization. Every callable verifies Firebase's authenticated email and reads the protected account record again. XChange's scoped account helper is in `functions/src/xchange/policy.ts`; Person 2 should review/consolidate it with the shared platform helper before production deployment.

Uploads must produce `listing-images/{uid}/{uploadId}/{fileName}` paths. Use new, immutable object names, MIME/type/size rules and ownership checks; do not permit one client to replace a referenced object with different bytes after validation. The server requires 1–5 distinct existing JPG/PNG/WebP objects, at most 5 MiB each. Demo category paths and data URLs are rejected by the live server. `imageSource` must use authenticated access; if it returns a blob URL, return a fresh URL per call because the view revokes it when unmounted. Clear any private image caches on logout. Cleanup of orphan uploads remains Person 2's Storage responsibility.

Saved items, chat and reports use the exact typed dependency methods in `firebaseRepository.ts`. The server will reject handovers until the genuine listing conversation exists. Contacts shown for proposing a handover come only from that owner's listing conversations and safe public profiles; the current contact picker is bounded to the first 30 conversations. Later contact paging belongs in the shared inbox integration.

## API and schema additions

- `listListings({scope?:'feed'|'mine', category?, mode?, prefix?, sort?:'newest'|'price-asc'|'price-desc', status?, cursor?, pageSize?})` → `{items,nextCursor}`. Default 20, maximum 40. `status` is owner-history-only. Price sorting requires `mode:'sale'`; prefix search clears price sorting. Cursors bind the member, campus and filters. Live views append pages and discard obsolete search responses.
- `getListing({listingId})` → `{listing,seller,deal,contacts}`. Seller projection omits email. Deal data is only returned to its two participants. Completed listings are readable by their owner and confirmed counterpart; unrelated members receive unavailable. Contact options are owner-only.
- `listings.pendingDealId?:string|null` locks a proposed handover. `confirmedDealId?:string` preserves confirmed participant access after completion. Content edits and direct status changes cannot bypass a pending deal.
- Listing versions are UTC ISO strings from trusted server timestamps. Successive writes advance by at least one millisecond, preventing two edits based on one ISO version from both succeeding.
- Maximum listing price: 100,000,000 paise (₹10 lakh). Sale positive, donation zero, swap null with a wanted-item description. Unknown content fields and owner/campus spoofing are rejected.
- Creation and deal proposals require UUID retry keys. Receipts are in `operations/{sha256(JSON.stringify(uid))}_{key}` with operation, payload hash, result and timestamps. Matching retries return the result; changed payloads fail. Keep a key for the same user action across retries. Check My Listings before changing an ambiguously failed create request.
- Server-only `xchangeRateLimits/{hash}` records enforce 10 new listings/minute and 30 edits/status updates/minute (20 proposals/minute). Receipt/rate expiry timestamps are supplied; a TTL policy is optional operational cleanup and is not enabled by this source.

The shipped Firestore and Storage rules still deny client access. These callables use server authorization and do not weaken the rules. Person 2 must implement and test the platform's own permitted reads/uploads. Deploy the supplied composite indexes to the development project and verify them there; the emulator does not prove production index availability.

## Run and verify

```bash
npm ci
npm --prefix functions ci
npm run dev
npm run build
npm test
npm run test:domain
npm run test:e2e
npm run test:xchange:emulator
```

Validation on 27 October 2026: frontend production build and Functions TypeScript build passed; 14 Vitest unit tests, 6 ride transition regression tests, 12 Playwright browser journeys and 12 Firestore emulator tests passed locally (44 total). Browser journeys include the original platform/ride demo checks plus the new marketplace and live-view contract checks. Remote CI results are reported by GitHub separately.

The emulator command uses a `demo-` project and refuses to run its tests against a production database. Java is required. CI installs Java 21. Frontend and Functions builds are separate checks.

Browser fixtures under `tests/fixtures` inject a deliberate test repository to verify live-view loading, errors, retry, draft preservation and account presentation. They are not part of Vite's production entrypoint and do not claim a connected live deployment. Firestore tests exercise actual transactions, but inject image metadata verification; real Storage/Auth service integration and platform rules tests remain Person 2's gate.

## Two-account demonstration

In local demo mode: Aarav opens the Engineering Mathematics listing and clicks Message seller. Switch to Sneha, open that listing, select Aarav under Student for handover, and propose. Sneha confirms; the item stays reserved. Switch to Aarav, open the same listing and confirm. The listing becomes completed and both see the confirmation. No new purchase conversation can start after completion.

For real-device acceptance, repeat with Person 2's actual approved accounts, authenticated image service and deployed development functions. This cannot be certified by switching local demo accounts.

## Remaining team gates

Person 2: real account provider/guards, campus administration, Storage and permission rules, saved/chat/report implementations, account/authorization review and staged deployment configuration. Person 3: XRide integration and the full two-device demonstration. Team: review this PR and verify staging indexes and actual upload permissions. Payments, promotions, business accounts, automated reviews and other P2 expansion features remain outside Person 1's first milestone.
