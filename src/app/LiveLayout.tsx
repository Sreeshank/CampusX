import { Link, NavLink, Outlet } from "react-router-dom";
import {
  Home,
  ShoppingBag,
  Bike,
  MessageCircle,
  UserRound,
  Bell,
} from "lucide-react";
import { Avatar } from "../components/ui";
import { useLiveXChange } from "../features/xchange/LiveXChange";
const links = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/xchange", label: "XChange", icon: ShoppingBag },
  { to: "/xride", label: "XRide", icon: Bike },
  { to: "/messages", label: "Messages", icon: MessageCircle },
  { to: "/profile", label: "Profile", icon: UserRound },
];
export function LiveLayout() {
  const { user } = useLiveXChange()!;
  return (
    <div className="app customer-template">
      <aside className="sidebar">
        <Link className="brand" to="/home">
          <span className="brand-mark">X</span>Campus<span>X</span>
        </Link>
        <div className="campus-label">KITS Warangal</div>
        <nav aria-label="Campus navigation">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to}>
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="side-profile">
          <Avatar name={user.displayName} />
          <div>
            <strong>{user.displayName}</strong>
            <small>Your campus community</small>
          </div>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <Link className="brand" to="/home">
            Campus<span>X</span>
          </Link>
          <div className="topbar-actions">
            <Link className="icon-button" to="/messages" aria-label="Messages">
              <MessageCircle size={20} />
            </Link>
            <Link
              className="icon-button"
              to="/notifications"
              aria-label="Notifications"
            >
              <Bell size={20} />
            </Link>
            <Link to="/profile" aria-label="Profile">
              <Avatar name={user.displayName} />
            </Link>
          </div>
        </header>
        <main>
          <Outlet />
        </main>
        <footer className="app-footer">Made for campus life.</footer>
      </div>
      <nav className="mobile-nav" aria-label="Main navigation">
        {links
          .filter((l) => l.to !== "/messages")
          .map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to}>
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
      </nav>
    </div>
  );
}
