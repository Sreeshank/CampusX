import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Bike, ShoppingBag } from "lucide-react";
import { PageHead, ErrorBox, Empty } from "../../components/ui";
import { errorText } from "../../../shared/validation";
import type { Listing } from "../../../shared/types";
import { useLiveXChange, LiveListingCard } from "../xchange/LiveXChange";
export function LiveHome() {
  const { user, repository } = useLiveXChange()!,
    [items, setItems] = useState<Listing[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [retry, setRetry] = useState(0);
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");
    repository
      .listListings({ pageSize: 4 })
      .then((p) => {
        if (alive) setItems(p.items);
      })
      .catch((e) => {
        if (alive) setError(errorText(e));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [repository, user.uid, retry]);
  return (
    <>
      <PageHead
        eyebrow="YOUR CAMPUS, CONNECTED"
        title={`Hey, ${user.displayName.split(" ")[0]}.`}
        description="Good finds. Shared journeys. Your campus community."
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
          <h2>Popular on campus</h2>
          <Link to="/xchange">
            View all <ArrowRight size={17} />
          </Link>
        </div>
        <ErrorBox message={error} />
        {loading ? (
          <p role="status">Loading campus listings…</p>
        ) : error ? (
          <button
            className="button secondary"
            onClick={() => setRetry((v) => v + 1)}
          >
            Retry listings
          </button>
        ) : items.length ? (
          <div className="listing-grid">
            {items.map((l) => (
              <LiveListingCard key={l.id} listing={l} />
            ))}
          </div>
        ) : (
          <Empty
            title="Be the first to share"
            text="Post an item to get your campus marketplace started."
            href="/xchange/new"
            action="Post an item"
          />
        )}
      </section>
    </>
  );
}
