# Starter status

## Implemented locally

Responsive app shell; Home; marketplace browsing and prefix/category/mode filters; listing creation/editing with category illustration or one uploaded compressed photo; owner lifecycle controls; saved items; ride creation/search; seat requests and driver decisions; cancellation; messaging and block actions; profiles; pending account gate; admin approval; listing report/removal; in-app notices; reset control.

This is a teaching/demo implementation. All users and data live in localStorage. Demo rules are easy to inspect and bypass through browser tools. A refresh restores this browser's data; independent devices/tabs are not synchronized. Sequential local seat checks do not demonstrate Firestore transaction safety. Real concurrency tests must be added against the server/emulators.

## Deliberate starter simplifications

- Demo account chooser replaces registration/login/password reset. These routes explicitly explain their status.
- Demo feeds filter a small in-memory dataset; live pagination/indexed search is not implemented.
- One optional uploaded image or category illustration; the specification's 1–5 live images remain a task.
- Demo profile data is stored together; public/private Firestore projection is not implemented.
- No map, push service, genuine college verification, real payment or cross-device chat.
- No ride edit UI, advanced admin suspension, message-report evidence workflow, confirmed deals/reviews or automated account export/deletion.
- Notifications are local UI notices, not push notifications.
- Backend exports are explicit stubs; Firebase rules deny all operations. Typed calls are integration examples, not active services.

## How to extend without confusion

Keep `shared/types.ts`, constants, validation and pure seat transitions as agreed contracts. Split large initial module files into components as features grow. Replace page imports from `src/lib/demo/store` with a reviewed app-data provider before adding live mode. Introduce asynchronous loading/error handling around server adapters. Complete the original API contracts; local method convenience names are mapped in FIREBASE_HANDOFF.md.

## Validation record

Six dependency-free ride transition tests passed locally. They cover final-seat exclusion, idempotent acceptance/cancellation, pending cancellation, owner checks and closed/past rides.

Frontend TypeScript/Vite production build, Functions TypeScript build, and nine demo engine/validation tests passed locally. Three Playwright browser checks passed: marketplace messaging/account switching, ride request/acceptance, and mobile layout/pending-account gating. The first messaging run coincided with browser installation and was rerun successfully after installation completed. Firebase live integration and server security tests remain implementation tasks.
