# Official references and technical decisions
Checked 18 October 2026. These sources describe platform capabilities; CampusX workflows, quotas and ownership assignments are design proposals by this handbook. Recheck vendor requirements before setup and deployment. No package version is claimed as permanently current.

| Topic | Official source | Use in this pack |
| --- | --- | --- |
| Vite setup | https://vite.dev/guide/ | React TypeScript scaffold and Node compatibility |
| Frontend environment variables | https://vite.dev/guide/env-and-mode | VITE_* values are browser-visible build-time values |
| Firebase web setup | https://firebase.google.com/docs/web/setup | Register Web app and use modular SDK configuration |
| Firebase API keys | https://firebase.google.com/docs/projects/api-keys | Web configuration does not replace authorization rules |
| Storage web setup | https://firebase.google.com/docs/storage/web/start | Storage setup and billing prerequisite |
| Callable functions | https://firebase.google.com/docs/functions/callable | Typed client calls and server authentication context |
| Transactions | https://firebase.google.com/docs/firestore/manage-data/transactions | Atomic request and seat updates; retry-aware design |
| Function runtime | https://firebase.google.com/docs/functions/manage-functions | Supported Node runtime and deployment settings |
| Maps key setup | https://developers.google.com/maps/documentation/javascript/get-api-key | Optional map key and usage restrictions |

Vendor documentation is not copied wholesale. Setup details and design guidance are summarized for this project. Firebase billing notes are not an estimate or promise of zero cost.
