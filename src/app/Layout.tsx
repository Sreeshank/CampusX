import { NavLink, Outlet, Link, useNavigate } from "react-router-dom";
import {
  Home,
  ShoppingBag,
  Bike,
  MessageCircle,
  UserRound,
  ShieldCheck,
  Bell,
  ArrowUpRight,
  Code2,
} from "lucide-react";
import { api, useDemo } from "../lib/demo/store";
import { Avatar } from "../components/ui";
const links = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/xchange", label: "XChange", icon: ShoppingBag },
  { to: "/xride", label: "XRide", icon: Bike },
  { to: "/messages", label: "Messages", icon: MessageCircle },
  { to: "/profile", label: "Profile", icon: UserRound },
];
export function Layout() {
  const s = useDemo();
  const user = s.users.find((u) => u.id === s.currentUserId)!;
  const navigate = useNavigate();
  const unread = s.notices.filter((n) => n.uid === user.id && !n.read).length;
  return (
    <div className="app customer-template">
      <aside className="sidebar">
        <Link className="brand" to="/home">
          <span className="brand-mark">X</span>Campus<span>X</span>
        </Link>
        <div className="campus-label">
          <span className="live-dot" />
          KITS Warangal
        </div>
        <div className="nav-label">YOUR CAMPUS, CONNECTED</div>
        <nav>
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to}>
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
          {user.role === "admin" && (
            <NavLink to="/admin">
              <ShieldCheck size={20} />
              <span>Administration</span>
            </NavLink>
          )}
        </nav>
        <div className="sidebar-note">
          <Code2 size={22} />
          <h3>Build something together.</h3>
          <p>Your team's starting point for a more connected campus.</p>
          <Link to="/guide">
            Team guide <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="side-profile">
          <Avatar name={user.displayName} />
          <div>
            <strong>{user.displayName}</strong>
            <small>Demo {user.role}</small>
          </div>
        </div>
      </aside>
      <div className="workspace">
        <div className="demo-bar">
          <span>
            <b>LOCAL DEMO</b> Fictional accounts · data stays in this browser
          </span>
          <label>
            Try as{" "}
            <select
              aria-label="Demo account"
              value={user.id}
              onChange={(e) => {
                api.switchUser(e.target.value);
                navigate(e.target.value === "pending" ? "/verify" : "/home");
              }}
            >
              {s.users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.displayName}
                </option>
              ))}
            </select>
          </label>
        </div>
        <header className="topbar">
          <div>
            <span className="mobile-brand">
              Campus<b>X</b>
            </span>
            <span className="desktop-label">Connect. Share. Ride.</span>
          </div>
          <div className="topbar-actions">
            <Link className="icon-button" to="/messages" aria-label="Messages">
              <MessageCircle size={20} />
            </Link>
            <span className="term-pill">Your campus circle</span>
            <Link
              className="icon-button notification-button"
              to="/notifications"
              aria-label="Notifications"
            >
              <Bell size={20} />
              {unread > 0 && <span>{unread}</span>}
            </Link>
            <Link to="/profile" aria-label="Profile">
              <Avatar name={user.displayName} />
            </Link>
          </div>
        </header>
        <main>
          <Outlet />
        </main>
        <footer className="app-footer">
          Made for campus life. Built by your team.
          <span>CampusX starter · v1.0</span>
        </footer>
      </div>
      <nav className="mobile-nav" aria-label="Main navigation">
        {links
          .filter((link) => link.to !== "/messages")
          .map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to}>
              <Icon size={19} />
              <span>
                {label === "Overview"
                  ? "Home"
                  : label === "My profile"
                    ? "Profile"
                    : label}
              </span>
            </NavLink>
          ))}
      </nav>
    </div>
  );
}
