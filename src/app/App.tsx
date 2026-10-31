import {
  BrowserRouter,
  HashRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { useEffect } from "react";
import { useDemo } from "../lib/demo/store";
import { Layout } from "./Layout";
import { Guide } from "./Guide";
import { Home } from "../features/home/Home";
import {
  Marketplace,
  ListingDetail,
  ListingForm,
} from "../features/xchange/XChange";
import { Rides, RideDetail, RideForm, MyRides } from "../features/xride/XRide";
import { Login, Verify } from "../features/auth/Auth";
import { Profile } from "../features/profile/Profile";
import { Messages } from "../features/messages/Messages";
import { Admin } from "../features/admin/Admin";
import { Notifications } from "../features/notifications/Notifications";
import { Empty } from "../components/ui";
// Static hosts use hash routes so refreshes never require server rewrites.
const Router = import.meta.env.BASE_URL === '/' ? BrowserRouter : HashRouter;
function SignedIn() {
  const s = useDemo();
  return s.currentUserId ? <Outlet /> : <Navigate to="/login" replace />;
}
function Verified() {
  const s = useDemo();
  const u = s.users.find((u) => u.id === s.currentUserId);
  return u?.verificationStatus === "verified" &&
    u.accountStatus === "active" ? (
    <Outlet />
  ) : (
    <Navigate to="/verify" replace />
  );
}
function ScrollReset() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
export default function App() {
  if (
    import.meta.env.VITE_DATA_MODE &&
    import.meta.env.VITE_DATA_MODE !== "demo"
  )
    return (
      <div className="auth-page">
        <div className="panel">
          <h1>Firebase integration is your team's next step.</h1>
          <p>
            This beginner starter runs in demo mode. The live provider has not
            been implemented. It will not silently use demo data when configured
            for Firebase.
          </p>
          <p>
            Read docs/FIREBASE_HANDOFF.md, or set VITE_DATA_MODE=demo to explore
            the local starter.
          </p>
        </div>
      </div>
    );
  return (
    <Router>
      <ScrollReset />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Login />} />
        <Route path="/forgot-password" element={<Login />} />
        <Route element={<SignedIn />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/guide" element={<Guide />} />
            <Route element={<Verified />}>
              <Route path="/home" element={<Home />} />
              <Route path="/xchange" element={<Marketplace />} />
              <Route path="/my-listings" element={<Marketplace mine />} />
              <Route path="/saved" element={<Marketplace saved />} />
              <Route path="/xchange/new" element={<ListingForm key="new" />} />
              <Route
                path="/xchange/:listingId/edit"
                element={<ListingForm />}
              />
              <Route path="/xchange/:listingId" element={<ListingDetail />} />
              <Route path="/xride" element={<Rides />} />
              <Route path="/xride/new" element={<RideForm />} />
              <Route path="/xride/:rideId" element={<RideDetail />} />
              <Route path="/my-rides" element={<MyRides />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/messages/:conversationId" element={<Messages />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/admin/*" element={<Admin />} />
            </Route>
            <Route
              path="*"
              element={
                <Empty
                  title="Page not found"
                  text="Let's get you back to campus."
                  href="/home"
                  action="Go home"
                />
              }
            />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}
