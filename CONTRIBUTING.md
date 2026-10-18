# Working together

## Fork and branch

1. On GitHub, open Sreeshank/CampusX and choose Fork. Forks preserve the connection to the leader's repository.
2. Clone your fork. Substitute YOUR_USERNAME below.

```bash
git clone https://github.com/YOUR_USERNAME/CampusX.git
cd CampusX
git remote add upstream https://github.com/Sreeshank/CampusX.git
npm ci
git switch -c feature/p2-login
```

3. Read your issue and role guide. Change only your module and agreed shared files.
4. Run relevant tests and `npm run build`.
5. Commit and push your branch; open a pull request targeting `Sreeshank/CampusX:main`.

```bash
git add .
git commit -m "Add email login screens"
git push -u origin feature/p2-login
```

6. Link the issue in the PR. Use `Refs #2` while it is partial; only `Closes #2` when the full work package is complete.
7. Ask a teammate to review. Merge through GitHub after checks pass.

To update your fork's main branch:

```bash
git switch main
git fetch upstream
git merge --ff-only upstream/main
git push origin main
```

If fast-forward fails, preserve your changes and resolve the divergence with the leader; do not force-push shared work. Collaborators with write access can use branches on the same repository instead of forks. GitHub Projects boards do not grant repository permissions.

## Team habits

Keep one feature per PR. Discuss shared type changes first. Person 2 reviews authorization on backend PRs; Person 1 coordinates UI integration. Never commit `.env.local`, private keys or service-account JSON. Each developer uses their own account. The public Firebase Web config is not a database permission boundary.

Dependencies are pinned at top level. Both lockfiles are committed; use `npm ci` for normal setup. If a dependency needs upgrading, do it in a dedicated reviewed PR.

## Scope

This source implements a local starter, not the entire product specification. Do not tick the production feature issue complete just because the demo UI works. Live authentication, database rules, upload restrictions, transactions, real-time subscriptions, error handling, pagination and emulator security tests are still required.
