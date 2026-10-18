import { PageHead } from "../components/ui";
export function Guide() {
  return (
    <>
      <PageHead
        eyebrow="TEAM STARTER"
        title="One app. Three owners."
        description="A working local demonstration and a clear place for everyone to start."
      />
      <div className="module-grid three">
        {[
          {
            n: 1,
            title: "Home + XChange",
            path: "src/features/xchange/",
            task: "Connect listing screens to your real Firebase adapter; implement listing functions.",
            issue: 1,
          },
          {
            n: 2,
            title: "Accounts + Platform",
            path: "src/features/auth/",
            task: "Add real authentication, profile approval, protected data reads, chat and admin services.",
            issue: 2,
          },
          {
            n: 3,
            title: "XRide + Integration",
            path: "src/features/xride/",
            task: "Replace local ride actions with transactional server callables and add concurrency tests.",
            issue: 3,
          },
        ].map((p) => (
          <div className="panel" key={p.n}>
            <div className="eyebrow">PERSON {p.n}</div>
            <h2>{p.title}</h2>
            <code>{p.path}</code>
            <p>{p.task}</p>
            <a
              className="button secondary"
              href={`https://github.com/Sreeshank/CampusX/issues/${p.issue}`}
              target="_blank"
              rel="noreferrer"
            >
              Open work package
            </a>
          </div>
        ))}
      </div>
      <div className="panel prose">
        <h2>Try the complete demo</h2>
        <ol>
          <li>As Aarav, open a textbook and message its seller.</li>
          <li>Switch to Sneha using the top bar and reply from Messages.</li>
          <li>
            Switch back to Aarav, request Sneha's ride, then switch to Sneha and
            accept in My rides.
          </li>
          <li>
            Return to Aarav and cancel the request; the seat becomes available
            again.
          </li>
          <li>
            Choose New Student to see pending verification, then Campus Admin to
            approve it.
          </li>
        </ol>
        <h2>What is local, and what comes next?</h2>
        <p>
          Demo data is stored in this browser. The account selector is not real
          authentication. There is no cross-device synchronization. The
          functions folder contains clearly marked server stubs, and Firebase
          rules deny access until your team implements and tests them.
        </p>
        <p>
          Read README.md, CONTRIBUTING.md, docs/STARTER_STATUS.md, and the
          original feature specifications in docs/specs/. Do not use this local
          demo for real student data.
        </p>
      </div>
    </>
  );
}
