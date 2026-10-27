import { Link } from "react-router-dom";
import {
  ArrowRight,
  ShoppingBag,
  Bike,
  Leaf,
  Users,
  Sparkles,
} from "lucide-react";
import { useDemo } from "../../lib/demo/store";
import { ListingCard, PageHead } from "../../components/ui";
import { useLiveXChange } from "../xchange/LiveXChange";
import { LiveHome } from "./LiveHome";
export function Home() {
  return useLiveXChange() ? <LiveHome /> : <DemoHome />;
}
function DemoHome() {
  const s = useDemo();
  const user = s.users.find((u) => u.id === s.currentUserId)!;
  const listings = s.listings
    .filter((l) => l.status === "active" && l.campusId === user.campusId)
    .slice(0, 4);
  return (
    <>
      <PageHead
        eyebrow="YOUR CAMPUS, CONNECTED"
        title={`Hey, ${user.displayName.split(" ")[0]}.`}
        description="Good finds. Shared journeys. People you already have something in common with."
      />
      <section className="customer-hero">
        <div className="customer-hero-copy">
          <span className="campus-chip">KITS Warangal</span>
          <h2>
            Campus<span>X</span>
          </h2>
          <p className="customer-tagline">For a smarter campus life</p>
          <p>
            Buy. Sell. Swap. Share.
            <br />
            Together at KITS.
          </p>
        </div>
        <img
          src="/campus-community.svg"
          alt="Illustration of three students together on campus"
        />
      </section>
      <div className="module-grid customer-modules">
        <Link to="/xchange" className="module-card exchange-module">
          <span className="module-icon">
            <ShoppingBag />
          </span>
          <div>
            <h3>XChange</h3>
            <p>Buy, Sell, Swap, Donate</p>
          </div>
          <ArrowRight className="module-arrow" />
        </Link>
        <Link to="/xride" className="module-card ride-module">
          <span className="module-icon">
            <Bike />
          </span>
          <div>
            <h3>XRide</h3>
            <p>Find &amp; share campus rides</p>
          </div>
          <ArrowRight className="module-arrow" />
        </Link>
      </div>
      <section className="section">
        <div className="section-heading">
          <div>
            <h2>Popular on campus</h2>
            <p>A few things looking for their next home.</p>
          </div>
          <Link to="/xchange">
            View all <ArrowRight size={17} />
          </Link>
        </div>
        <div className="listing-grid">
          {listings.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      </section>
      <section className="values-row">
        <div>
          <Users />
          <span>
            <b>Your campus community</b>
            <small>Connect with fellow students.</small>
          </span>
        </div>
        <div>
          <Leaf />
          <span>
            <b>More reuse, less waste</b>
            <small>Small choices. A useful second life.</small>
          </span>
        </div>
        <div>
          <Sparkles />
          <span>
            <b>Built around student life</b>
            <small>Keep the essentials within reach.</small>
          </span>
        </div>
      </section>
    </>
  );
}
