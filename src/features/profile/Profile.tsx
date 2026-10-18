import { Link, useNavigate } from "react-router-dom";
import { api, useDemo, resetDemo } from "../../lib/demo/store";
import {
  Avatar,
  PageHead,
  Status,
  ErrorBox,
  useAction,
} from "../../components/ui";
export function Profile() {
  const s = useDemo();
  const u = s.users.find((u) => u.id === s.currentUserId)!;
  const { error, run } = useAction();
  const navigate = useNavigate();
  return (
    <>
      <PageHead
        eyebrow="YOUR CAMPUS IDENTITY"
        title="A little about you."
        description="Keep your profile useful, and your personal information private."
      />
      <div className="profile-grid">
        <div className="panel profile-summary">
          <Avatar name={u.displayName} large />
          <h2>{u.displayName}</h2>
          <p>
            {u.department} · {u.year}
          </p>
          <Status>{u.verificationStatus}</Status>
          <p className="fine-print">Fictional account · KITS Warangal</p>
          <div className="stack">
            <Link className="button secondary" to="/my-listings">
              My listings
            </Link>
            <Link className="button secondary" to="/my-rides">
              My rides
            </Link>
            {u.role === "admin" && (
              <Link className="button secondary" to="/admin">
                Administration
              </Link>
            )}
            <Link className="text-button" to="/guide">
              Developer team guide
            </Link>
          </div>
        </div>
        <form
          className="form-card"
          key={u.id}
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            run(() => {
              api.updateProfile({
                displayName: String(f.get("name")),
                department: String(f.get("department")),
                year: String(f.get("year")),
              });
              alert("Demo profile saved.");
            });
          }}
        >
          <h2>Profile details</h2>
          <ErrorBox message={error} />
          <label>
            Display name
            <input
              name="name"
              required
              minLength={2}
              maxLength={60}
              defaultValue={u.displayName}
            />
          </label>
          <label>
            Department
            <input
              name="department"
              maxLength={80}
              defaultValue={u.department}
            />
          </label>
          <label>
            Year
            <input name="year" maxLength={30} defaultValue={u.year} />
          </label>
          <label>
            Private account email
            <input disabled value={u.email} />
          </label>
          <button className="button primary">Save profile</button>
          <hr />
          <h3>Demo controls</h3>
          <p className="fine-print">
            Reset clears this browser's fictional listings, messages and
            requests. It does not affect a Firebase project.
          </p>
          <div className="actions">
            <button
              type="button"
              className="button secondary"
              onClick={() => {
                if (confirm("Reset all local demo data?")) resetDemo();
              }}
            >
              Reset demo
            </button>
            <button
              type="button"
              className="text-button"
              onClick={() => {
                api.switchUser("");
                navigate("/login");
              }}
            >
              Sign out of demo
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
