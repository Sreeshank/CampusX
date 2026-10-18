# Team workflow, integration and release
## Assignment rule
The leader creates small feature issues using templates/FEATURE_TASK.md. Each issue has a feature ID, owner, screen, callable/data dependency and acceptance evidence. Person 2 owns common contracts but everyone reviews changes that affect their module. Person 1 owns shared components/router; Person 3 owns ride functions; Person 2 owns rules and deployment configuration. Agree changes to shared files before editing.

## Daily workflow
Pull main; create a small feature branch such as feature/p1-create-listing. Implement one tested slice; commit; open a pull request; request a teammate review. Merge only when the app builds and relevant tests pass. Never merge personal .env files. Keep package-lock.json committed and resolve dependency conflicts together. Every developer uses their own account rather than shared passwords.

## Integration gates
Gate 1: all members can run same app and emulator seed, login and see pending/verified states.
Gate 2: listing → discovery → private conversation works with two accounts.
Gate 3: ride → request → acceptance works with two accounts and survives retries.
Gate 4: unauthorized access tests, reporting, account suspension and moderator actions work.
Gate 5: staging deployment, real index checks, responsive UI and no test data presented as live.

## Review evidence
State what changed, why, and how tested. Include at least one failure case relevant to the change. Testers record actual output, not “should work.” Mark incomplete APIs and mock adapters clearly. Person 2 reviews authorization for every function; Person 1 or 3 reviews UX for platform features. If Person 2 is overloaded, postpone P1 rather than removing access checks from P0.

## Two-account demo script
A and B register and verify email. Admin approves campus membership. A posts a ₹300 textbook; B searches and sends a message. A marks the listing completed after the real-world handoff (self-reported P0). A offers one seat from KITS Main Gate to Hanamkonda for a future time at ₹40 cost share. B requests. A accepts. B cancels before departure. Seats return to one exactly once. B reports a test listing; admin reviews and removes it with a reason. Student C cannot open A/B chat or admin dashboard.

## Out of scope for first delivery
APK/mobile native app; payment gateway; wallet; automated college identity verification; live driver location; automated route optimization; background checks; emergency dispatch; revenue guarantees. Maps, push and ratings are stage P1 and may be absent from a valid P0 demo.
