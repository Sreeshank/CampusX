import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Plus,
  Search,
  ArrowLeft,
  MessageCircle,
  Flag,
  BookOpen,
  Laptop,
  Armchair,
  Backpack,
  Bike,
  Grid2X2,
  Shapes,
} from "lucide-react";
import { api, useDemo } from "../../lib/demo/store";
import { CATEGORIES, CONDITIONS } from "../../../shared/constants";
import type { ListingMode, CreateListingInput } from "../../../shared/types";
import {
  PageHead,
  ListingCard,
  Empty,
  ProductArt,
  Avatar,
  Status,
  ErrorBox,
  useAction,
} from "../../components/ui";
import { money } from "../../lib/format";
import { compressImage } from "../../lib/images";
import { errorText } from "../../../shared/validation";
const categoryIcons = {
  all: Grid2X2,
  books: BookOpen,
  electronics: Laptop,
  furniture: Armchair,
  hostel: Backpack,
  bicycles: Bike,
  other: Shapes,
};
export function Marketplace({
  saved = false,
  mine = false,
}: {
  saved?: boolean;
  mine?: boolean;
}) {
  const s = useDemo();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [mode, setMode] = useState("all");
  const items = s.listings.filter(
    (l) =>
      (mine ? l.ownerId === s.currentUserId : l.status === "active") &&
      (!saved || s.saved[s.currentUserId]?.includes(l.id)) &&
      (category === "all" || l.category === category) &&
      (mode === "all" || l.mode === mode) &&
      l.title.toLowerCase().startsWith(query.trim().toLowerCase()),
  );
  return (
    <>
      <PageHead
        eyebrow="XCHANGE · YOUR CAMPUS MARKETPLACE"
        title={mine ? "Your listings" : saved ? "Saved for later" : "XChange"}
        description="Pre-loved essentials, useful swaps, and things worth passing on."
      >
        <Link className="button primary" to="/xchange/new">
          <Plus size={18} />
          Post an item
        </Link>
      </PageHead>
      <div className="tabs">
        <Link className={!mine && !saved ? "selected" : ""} to="/xchange">
          Discover
        </Link>
        <Link className={mine ? "selected" : ""} to="/my-listings">
          My listings
        </Link>
        <Link className={saved ? "selected" : ""} to="/saved">
          Saved items
        </Link>
      </div>
      <div className="search-row">
        <div className="search-box">
          <Search size={18} />
          <input
            aria-label="Search listings"
            placeholder="Search by the beginning of an item title…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select
          aria-label="Listing mode"
          value={mode}
          onChange={(e) => setMode(e.target.value)}
        >
          <option value="all">All exchanges</option>
          <option value="sale">For sale</option>
          <option value="swap">Swaps</option>
          <option value="donation">Free items</option>
        </select>
      </div>
      <div className="chips category-tiles" aria-label="Listing categories">
        {["all", ...CATEGORIES].map((c) => {
          const Icon = categoryIcons[c as keyof typeof categoryIcons];
          return (
            <button
              key={c}
              onClick={() => setCategory(c)}
              aria-pressed={category === c}
              className={category === c ? "active" : ""}
            >
              <span className="category-tile-icon">
                <Icon size={24} />
              </span>
              {c === "all" ? "All items" : c}
            </button>
          );
        })}
      </div>
      <div className="result-caption">
        {items.length} {items.length === 1 ? "item" : "items"} · KITS Warangal
      </div>
      {items.length ? (
        <div className="listing-grid">
          {items.map((l) => (
            <div key={l.id}>
              <ListingCard listing={l} />
              {mine && (
                <div className="under-card">
                  <Status>{l.status}</Status>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <Empty
          title="Nothing here just yet"
          text="Try another filter, or be the first to share something."
          href="/xchange/new"
          action="Post an item"
        />
      )}
    </>
  );
}
export function ListingDetail() {
  const { listingId } = useParams();
  const s = useDemo();
  const l = s.listings.find((l) => l.id === listingId);
  const navigate = useNavigate();
  const { error, run } = useAction();
  const [reason, setReason] = useState("");
  const [reporting, setReporting] = useState(false);
  const [notice, setNotice] = useState("");
  if (
    !l ||
    l.status === "removed" ||
    (["completed", "withdrawn"].includes(l.status) &&
      l.ownerId !== s.currentUserId)
  )
    return (
      <Empty
        title="Item unavailable"
        text="This item may have been withdrawn or removed."
        href="/xchange"
        action="Back to XChange"
      />
    );
  const owner = s.users.find((u) => u.id === l.ownerId)!;
  const own = l.ownerId === s.currentUserId;
  return (
    <>
      <Link className="back-link" to="/xchange">
        <ArrowLeft size={17} />
        Back to XChange
      </Link>
      <div className="detail-grid">
        <ProductArt listing={l} large />
        <div className="detail-copy">
          <div className="eyebrow">
            {l.category} / {l.condition}
          </div>
          <h1>{l.title}</h1>
          <div className="detail-price">{money(l.pricePaise)}</div>
          <Status>{l.status}</Status>
          <p className="detail-description">{l.description}</p>
          {l.mode === "swap" && (
            <div className="info-box">Looking to swap for: {l.swapWanted}</div>
          )}
          <div className="seller">
            <Avatar name={owner.displayName} />
            <div>
              <strong>{owner.displayName}</strong>
              <small>{owner.department} · KITS Warangal</small>
            </div>
          </div>
          <ErrorBox message={error} />
          {notice && (
            <p role="status" className="success">
              {notice}
            </p>
          )}
          {own ? (
            <div className="stack">
              {["active", "reserved"].includes(l.status) && (
                <>
                  <Link className="button primary" to={`/xchange/${l.id}/edit`}>
                    Edit listing
                  </Link>
                  <button
                    className="button secondary"
                    onClick={() =>
                      run(() =>
                        api.setListingStatus(
                          l.id,
                          l.status === "active" ? "reserved" : "active",
                        ),
                      )
                    }
                  >
                    {l.status === "active" ? "Reserve item" : "Make available"}
                  </button>
                  <button
                    className="button secondary"
                    onClick={() =>
                      run(() => api.setListingStatus(l.id, "completed"))
                    }
                  >
                    Mark{" "}
                    {l.mode === "sale"
                      ? "sold"
                      : l.mode === "donation"
                        ? "donated"
                        : "swapped"}
                  </button>
                  <button
                    className="text-button"
                    onClick={() => {
                      if (confirm("Withdraw this listing?"))
                        run(() => api.setListingStatus(l.id, "withdrawn"));
                    }}
                  >
                    Withdraw listing
                  </button>
                </>
              )}
            </div>
          ) : (
            <>
              <button
                className="button primary full"
                disabled={l.status !== "active"}
                onClick={() =>
                  run(() => {
                    const result = api.openConversation(
                      "listing",
                      l.id,
                      owner.id,
                    );
                    navigate(`/messages/${result.conversationId}`);
                  })
                }
              >
                <MessageCircle size={18} />
                Message seller
              </button>
              <p className="fine-print">
                Arrange the exchange together. No payment is collected in this
                starter.
              </p>
              <button
                className="text-button"
                onClick={() => setReporting(!reporting)}
              >
                <Flag size={15} />
                Report listing
              </button>
              {reporting && (
                <form
                  className="report-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    run(() => {
                      api.submitReport("listing", l.id, reason);
                      setReporting(false);
                      setNotice("Report submitted to the demo admin.");
                    });
                  }}
                >
                  <label>
                    What is the concern?
                    <textarea
                      required
                      minLength={5}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                  </label>
                  <button className="button secondary">Submit report</button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
export function ListingForm() {
  const { listingId } = useParams();
  const s = useDemo();
  const existing = s.listings.find((l) => l.id === listingId);
  const navigate = useNavigate();
  const { error, setError, run } = useAction();
  const [mode, setMode] = useState<ListingMode>(existing?.mode ?? "sale");
  const [image, setImage] = useState(existing?.imagePaths[0] ?? "");
  const [uploading, setUploading] = useState(false);
  const [key] = useState(() => crypto.randomUUID());
  if (listingId && (!existing || existing.ownerId !== s.currentUserId))
    return (
      <Empty
        title="You cannot edit this listing"
        text="Open one of your own listings."
        href="/my-listings"
        action="My listings"
      />
    );
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const input: CreateListingInput = {
      title: String(f.get("title")),
      description: String(f.get("description")),
      category: String(f.get("category")),
      condition: String(f.get("condition")),
      mode,
      pricePaise:
        mode === "swap"
          ? null
          : mode === "donation"
            ? 0
            : Math.round(Number(f.get("price")) * 100),
      swapWanted: String(f.get("swapWanted") ?? ""),
      imagePaths: [image || `demo:${f.get("category")}`],
      idempotencyKey: key,
    };
    run(() => {
      if (existing) {
        api.updateListing(existing.id, input, existing.updatedAt);
        navigate(`/xchange/${existing.id}`);
      } else {
        const result = api.createListing(input);
        navigate(`/xchange/${result.listingId}`);
      }
    });
  }
  return (
    <>
      <PageHead
        eyebrow="XCHANGE"
        title={
          existing ? "Give your listing an update." : "Something to pass on?"
        }
        description="A few details can help your item find its next home."
      />
      <form className="form-card" onSubmit={submit}>
        <ErrorBox message={error} />
        <div className="form-grid">
          <label>
            Item title
            <input
              required
              minLength={3}
              maxLength={100}
              name="title"
              defaultValue={existing?.title}
              placeholder="e.g. Engineering Mathematics textbook"
            />
          </label>
          <label>
            Exchange type
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as ListingMode)}
            >
              <option value="sale">Sell</option>
              <option value="swap">Swap</option>
              <option value="donation">Donate</option>
            </select>
          </label>
          <label>
            Category
            <select
              name="category"
              defaultValue={existing?.category ?? "books"}
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            Condition
            <select
              name="condition"
              defaultValue={existing?.condition ?? "good"}
            >
              {CONDITIONS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          {mode === "sale" && (
            <label>
              Price (₹)
              <input
                required
                type="number"
                name="price"
                min="0.01"
                step="0.01"
                defaultValue={
                  existing?.pricePaise ? existing.pricePaise / 100 : ""
                }
              />
            </label>
          )}
          {mode === "swap" && (
            <label>
              What would you like in return?
              <input
                required
                name="swapWanted"
                maxLength={200}
                defaultValue={existing?.swapWanted}
              />
            </label>
          )}
        </div>
        <label>
          Description
          <textarea
            required
            minLength={10}
            maxLength={2000}
            name="description"
            rows={4}
            defaultValue={existing?.description}
            placeholder="Condition, useful details, and where to meet…"
          />
        </label>
        <label>
          Item photo{" "}
          <span className="label-note">
            Optional in demo; a category illustration is used otherwise.
          </span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setUploading(true);
              setError("");
              try {
                setImage(api.saveImage(await compressImage(file)));
              } catch (err) {
                setError(errorText(err));
              } finally {
                setUploading(false);
              }
            }}
          />
        </label>
        {image && <p className="success">Image ready.</p>}
        <div className="form-footer">
          <Link to="/xchange">Cancel</Link>
          <button disabled={uploading} className="button primary">
            {uploading
              ? "Preparing image…"
              : existing
                ? "Save changes"
                : "Publish listing"}
          </button>
        </div>
      </form>
    </>
  );
}
