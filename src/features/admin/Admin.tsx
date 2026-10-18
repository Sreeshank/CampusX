import { useState } from "react";
import { api, useDemo } from "../../lib/demo/store";
import {
  PageHead,
  Empty,
  Status,
  ErrorBox,
  useAction,
} from "../../components/ui";
export function Admin() {
  const s = useDemo();
  const u = s.users.find((u) => u.id === s.currentUserId);
  const { error, run } = useAction();
  const [reason, setReason] = useState("");
  if (u?.role !== "admin")
    return (
      <Empty
        title="Admin access required"
        text="This area is for authorized campus moderators."
      />
    );
  const pending = s.users.filter((u) => u.verificationStatus === "pending");
  return (
    <>
      <PageHead
        eyebrow="ADMINISTRATION · LOCAL DEMO"
        title="Look after your campus."
        description="Review membership, respond to reports, and keep an audit trail."
      />
      <div className="info-box">
        These are local demonstration actions. Live verification, server roles
        and moderation rules are still to be implemented.
      </div>
      <ErrorBox message={error} />
      <div className="stats-row">
        <div className="panel">
          <strong>{pending.length}</strong>
          <p>Pending members</p>
        </div>
        <div className="panel">
          <strong>{s.reports.filter((r) => r.status === "open").length}</strong>
          <p>Open reports</p>
        </div>
        <div className="panel">
          <strong>{s.audit.length}</strong>
          <p>Recorded actions</p>
        </div>
      </div>
      <div className="panel">
        <label>
          Reason for the next moderation action
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Verified against the demonstration roster"
            minLength={5}
          />
        </label>
      </div>
      <h2 className="subheading">Membership requests</h2>
      {pending.length ? (
        pending.map((p) => (
          <div className="panel request-row" key={p.id}>
            <div>
              <b>{p.displayName}</b>
              <p>{p.email}</p>
            </div>
            <div className="actions">
              <button
                className="button primary"
                onClick={() =>
                  run(() => api.reviewVerification(p.id, "approve", reason))
                }
              >
                Approve member
              </button>
              <button
                className="button secondary"
                onClick={() =>
                  run(() => api.reviewVerification(p.id, "reject", reason))
                }
              >
                Reject
              </button>
            </div>
          </div>
        ))
      ) : (
        <Empty
          title="You're all caught up"
          text="No pending membership requests."
        />
      )}
      <h2 className="subheading">Reports</h2>
      {s.reports.length ? (
        s.reports.map((r) => (
          <div className="panel" key={r.id}>
            <div className="split">
              <b>{r.targetType} report</b>
              <Status>{r.status}</Status>
            </div>
            <p>{r.reason}</p>
            <small>Target: {r.targetId}</small>
            {r.status === "open" ? (
              <div className="actions">
                <button
                  className="button secondary"
                  onClick={() =>
                    run(() => api.resolveReport(r.id, reason, false))
                  }
                >
                  Resolve report
                </button>
                {r.targetType === "listing" && (
                  <button
                    className="button primary"
                    onClick={() =>
                      run(() => api.resolveReport(r.id, reason, true))
                    }
                  >
                    Remove listing & resolve
                  </button>
                )}
              </div>
            ) : (
              <p>{r.resolution}</p>
            )}
          </div>
        ))
      ) : (
        <Empty
          title="No reports yet"
          text="Reports submitted from product details appear here."
        />
      )}
      <h2 className="subheading">Audit log</h2>
      <div className="panel">
        {s.audit.length ? (
          s.audit
            .slice()
            .reverse()
            .map((a, i) => (
              <p key={i}>
                {a.action}
                <small className="muted"> · {a.at}</small>
              </p>
            ))
        ) : (
          <p className="muted">No moderation actions yet.</p>
        )}
      </div>
    </>
  );
}
