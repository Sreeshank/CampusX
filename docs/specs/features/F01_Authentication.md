# F01 — Authentication
## Owner and stage
Person 2 • P0
Routes: /login, /register, /forgot-password
## User goal
Create an account, verify email, log in, reset a forgotten password and log out.
## Frontend work
Email/password/name forms; verification reminder; resend button with cooldown; accessible field errors; return to intended route after login.
## Backend work
Use createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword, sendPasswordResetEmail and signOut. After login call bootstrapProfile; reload Auth user and refresh token after email verification. Never collect/store passwords outside Auth.
## APIs and data
Auth SDK; bootstrapProfile; users
Exact payloads and authorization are defined in shared/04_API_CONTRACT.md; canonical fields are in shared/03_DATABASE.md. Use those names rather than inventing competing schemas.
## Validation and edge cases
Handle duplicate registration, weak password, wrong credentials, expired reset link and offline state. Do not infer campus approval from email_verified.
## Acceptance tests
A new user reaches pending verification; reset works; logout clears listeners and private screen state; direct protected URL redirects.
## Dependencies and handoff
Firebase Auth enabled; authorized domains; F02 campus approval.
Provide a short demonstration, one failure/unauthorized case and the reviewed pull request. All implementation remains proposed until that evidence exists. See shared/05_SECURITY_AND_TESTS.md for cross-feature checks.
