import { Link, useNavigate } from "react-router-dom";
import { api, useDemo } from "../../lib/demo/store";
import { Avatar, PageHead, Status } from "../../components/ui";
export function Login() {
  const s = useDemo();
  const navigate = useNavigate();
  return (
    <div className="auth-page">
      <Link className="brand" to="/home">
        <span className="brand-mark">X</span>Campus<span>X</span>
      </Link>
      <div className="panel">
        <PageHead
          eyebrow="BEGINNER STARTER"
          title="Step into your campus."
          description="Choose a fictional account to explore the local demo. No password or API key is needed."
        />
        <div className="stack">
          {s.users.map((u) => (
            <button
              className="account-choice"
              key={u.id}
              onClick={() => {
                api.switchUser(u.id);
                navigate(
                  u.verificationStatus === "verified" ? "/home" : "/verify",
                );
              }}
            >
              <Avatar name={u.displayName} />
              <span>
                <b>{u.displayName}</b>
                <small>
                  {u.role} · {u.verificationStatus}
                </small>
              </span>
            </button>
          ))}
        </div>
        <p className="fine-print">
          Real sign-up, email verification and password reset are Person 2's
          Firebase tasks. This account selector is only for local demonstration.
        </p>
      </div>
    </div>
  );
}
export function Verify() {
  const s = useDemo();
  const u = s.users.find((u) => u.id === s.currentUserId)!;
  return (
    <>
      <PageHead
        eyebrow="CAMPUS MEMBERSHIP"
        title="Your campus connection."
        description="Membership approval is separate from verifying an email address."
      />
      <div className="panel narrow">
        <Status>{u.verificationStatus}</Status>
        <h2>
          {u.verificationStatus === "verified"
            ? "You’re ready to explore."
            : "Your campus approval is pending."}
        </h2>
        <p>
          In this demo, switch to Campus Admin and open Administration to review
          this account. Real approval will require your team's agreed college
          verification process.
        </p>
        <Link
          className="button primary"
          to={u.verificationStatus === "verified" ? "/home" : "/profile"}
        >
          {u.verificationStatus === "verified" ? "Go to home" : "View profile"}
        </Link>
      </div>
    </>
  );
}
