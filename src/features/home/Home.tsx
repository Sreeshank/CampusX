import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowRight,
  ShoppingBag,
  CarFront,
  Leaf,
  Users,
  Sparkles,
  GraduationCap,
} from "lucide-react";
import { useDemo } from "../../lib/demo/store";
import { ListingCard, PageHead } from "../../components/ui";
export function Home() {
  const s = useDemo();
  const user = s.users.find((u) => u.id === s.currentUserId)!;
  const listings = s.listings
    .filter((l) => l.status === "active" && l.campusId === user.campusId)
    .slice(0, 4);
  return (
    <>
      <PageHead
        eyebrow="A LITTLE MORE CAMPUS. A LITTLE LESS HASSLE."
        title={`Hey, ${user.displayName.split(" ")[0]}.`}
        description="Good finds. Shared journeys. People you already have something in common with."
      />
      <section className="hero">
        <div className="hero-copy">
          <div className="hero-pill">
            <Sparkles size={15} /> Your campus, in good company
          </div>
          <h2>
            Great things happen
            <br />
            when we <em>share.</em>
          </h2>
          <p>
            Give your things a second chapter.
            <br />
            Find someone going your way.
          </p>
          <Link className="button white" to="/xchange">
            Explore XChange <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="floating-card floating-book">
            <ShoppingBag />
            <span>
              Find your next
              <br />
              <b>good thing.</b>
            </span>
          </div>
          <div className="campus-building">
            <GraduationCap size={80} strokeWidth={1} />
            <span>
              CAMPUS
              <br />
              <b>CONNECTIONS</b>
            </span>
          </div>
          <div className="floating-card floating-ride">
            <CarFront />
            <span>
              Better
              <br />
              <b>together.</b>
            </span>
          </div>
          <span className="star star-one">✦</span>
          <span className="star star-two">✧</span>
        </div>
      </section>
      <div className="module-grid">
        <Link to="/xchange" className="module-card">
          <span className="module-icon purple">
            <ShoppingBag />
          </span>
          <div>
            <h3>XChange</h3>
            <p>Buy, sell, swap, or give something back.</p>
          </div>
          <ArrowUpRight className="module-arrow" />
        </Link>
        <Link to="/xride" className="module-card">
          <span className="module-icon mint">
            <CarFront />
          </span>
          <div>
            <h3>XRide</h3>
            <p>Same direction? Share the journey.</p>
          </div>
          <ArrowUpRight className="module-arrow" />
        </Link>
      </div>
      <section className="section">
        <div className="section-heading">
          <div>
            <h2>Fresh on your campus</h2>
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
