import { useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  BookOpen,
  Bike,
  LampDesk,
  Armchair,
  Package,
  Heart,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import type { Listing } from "../../shared/types";
import { errorText } from "../../shared/validation";
import { money } from "../lib/format";
import { api, useDemo } from "../lib/demo/store";
export function useAction() {
  const [error, setError] = useState("");
  function run(fn: () => void) {
    setError("");
    try {
      fn();
    } catch (e) {
      setError(errorText(e));
    }
  }
  return { error, setError, run };
}
export function ErrorBox({ message }: { message: string }) {
  return message ? (
    <div role="alert" className="error">
      <AlertCircle size={18} />
      {message}
    </div>
  ) : null;
}
export function PageHead({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="page-head">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {children}
    </div>
  );
}
export function Empty({
  title,
  text,
  href,
  action,
}: {
  title: string;
  text: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="empty">
      <Package size={30} />
      <h3>{title}</h3>
      <p>{text}</p>
      {href && (
        <Link className="button primary" to={href}>
          {action}
          <ArrowRight size={16} />
        </Link>
      )}
    </div>
  );
}
export function Status({ children }: { children: ReactNode }) {
  return (
    <span className={"status status-" + String(children)}>{children}</span>
  );
}
export function Avatar({
  name,
  large = false,
}: {
  name: string;
  large?: boolean;
}) {
  return (
    <span className={"avatar" + (large ? " large" : "")}>
      {name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")}
    </span>
  );
}
export function ProductArt({
  listing,
  large = false,
}: {
  listing: Listing;
  large?: boolean;
}) {
  const s = useDemo();
  const [selectedImage, setSelectedImage] = useState(0);
  const image =
    s.images[
      listing.imagePaths[Math.min(selectedImage, listing.imagePaths.length - 1)]
    ];
  const Icon =
    listing.category === "books"
      ? BookOpen
      : listing.category === "bicycles"
        ? Bike
        : listing.category === "electronics"
          ? LampDesk
          : listing.category === "furniture"
            ? Armchair
            : Package;
  return (
    <div className="product-gallery">
      <div
        className={`product-art art-${listing.category} ${large ? "art-large" : ""}`}
      >
        {image ? (
          <img src={image} alt={listing.title} />
        ) : (
          <>
            <div className="art-ring" />
            <Icon aria-hidden="true" strokeWidth={1.1} />
            <span className="art-caption">
              {listing.category === "books"
                ? "A new chapter"
                : listing.category === "bicycles"
                  ? "Keep moving"
                  : "A second life"}
            </span>
          </>
        )}
      </div>
      {large && listing.imagePaths.length > 1 && (
        <div className="gallery-thumbnails" aria-label="Item photos">
          {listing.imagePaths.map((path, i) => (
            <button
              key={path}
              type="button"
              aria-label={`View photo ${i + 1}`}
              aria-pressed={selectedImage === i}
              onClick={() => setSelectedImage(i)}
            >
              {s.images[path] ? (
                <img src={s.images[path]} alt={`Item photo ${i + 1}`} />
              ) : (
                <span>Photo {i + 1}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
export function ListingCard({ listing }: { listing: Listing }) {
  const s = useDemo();
  const saved = s.saved[s.currentUserId]?.includes(listing.id);
  const { error, run } = useAction();
  return (
    <article className="listing-card">
      <div className="card-image">
        <Link to={`/xchange/${listing.id}`} aria-label={listing.title}>
          <ProductArt listing={listing} />
        </Link>
        <button
          className={"save-button " + (saved ? "saved" : "")}
          aria-label={`${saved ? "Unsave" : "Save"} ${listing.title}`}
          onClick={() => run(() => api.saveListing(listing.id))}
        >
          <Heart size={17} fill={saved ? "currentColor" : "none"} />
        </button>
        <span className="mode-tag">
          {listing.mode === "donation"
            ? "Giveaway"
            : listing.mode === "swap"
              ? "Swap"
              : "Pre-loved"}
        </span>
      </div>
      <div className="card-body">
        <div className="card-meta">
          {listing.category} <span>•</span>{" "}
          {listing.condition.replace("-", " ")}
        </div>
        <Link className="card-title" to={`/xchange/${listing.id}`}>
          {listing.title}
        </Link>
        <div className="card-bottom">
          <strong>{money(listing.pricePaise)}</strong>
          <Link
            to={`/xchange/${listing.id}`}
            aria-label={`View ${listing.title}`}
          >
            <ArrowUpRight size={19} />
          </Link>
        </div>
        <ErrorBox message={error} />
      </div>
    </article>
  );
}
