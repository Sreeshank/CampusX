import { useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
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
import {
  useLiveXChange,
  LiveMarketplace,
  LiveListingDetail,
  LiveListingForm,
} from "./LiveXChange";
export function Marketplace(props: { saved?: boolean; mine?: boolean }) {
  return useLiveXChange() ? (
    <LiveMarketplace {...props} />
  ) : (
    <DemoMarketplace {...props} />
  );
}
export function ListingDetail() {
  return useLiveXChange() ? <LiveListingDetail /> : <DemoListingDetail />;
}
export function ListingForm() {
  return useLiveXChange() ? <LiveListingForm /> : <DemoListingForm />;
}
const categoryIcons = {
  all: Grid2X2,
  books: BookOpen,
  electronics: Laptop,
  furniture: Armchair,
  hostel: Backpack,
  bicycles: Bike,
  other: Shapes,
};
function DemoMarketplace({
  saved = false,
  mine = false,
}: {
  saved?: boolean;
  mine?: boolean;
}) {
  const s = useDemo();
  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? "",
    category = params.get("category") ?? "all",
    mode = params.get("mode") ?? "all",
    sort = params.get("sort") ?? "newest",
    status = params.get("status") ?? "all";
  const [page, setPage] = useState({ key: "", count: 12 });
  const filterKey = params.toString() + s.currentUserId + mine + saved;
  const visibleCount = page.key === filterKey ? page.count : 12;
  function filter(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value === "all" || !value) next.delete(key);
    else next.set(key, value);
    if (key === "q") next.delete("sort");
    if (key === "sort" && value !== "newest") {
      next.delete("q");
      next.set("mode", "sale");
    }
    if (key === "mode" && value !== "sale") next.delete("sort");
    setParams(next, { replace: true });
  }
  const currentUser = s.users.find((u) => u.id === s.currentUserId)!;
  const items = s.listings
    .filter(
      (l) =>
        l.campusId === currentUser.campusId &&
        (mine
          ? l.ownerId === s.currentUserId &&
            (status === "all" || l.status === status)
          : l.status === "active") &&
        (!saved || s.saved[s.currentUserId]?.includes(l.id)) &&
        (category === "all" || l.category === category) &&
        (mode === "all" || l.mode === mode) &&
        l.title.toLowerCase().startsWith(query.trim().toLowerCase()),
    )
    .sort((a, b) =>
      sort === "price-asc"
        ? (a.pricePaise ?? 0) - (b.pricePaise ?? 0) || a.id.localeCompare(b.id)
        : sort === "price-desc"
          ? (b.pricePaise ?? 0) - (a.pricePaise ?? 0) ||
            a.id.localeCompare(b.id)
          : b.createdAt.localeCompare(a.createdAt) || a.id.localeCompare(b.id),
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
            onChange={(e) => filter("q", e.target.value)}
          />
        </div>
        <select
          aria-label="Listing mode"
          value={mode}
          onChange={(e) => filter("mode", e.target.value)}
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
              onClick={() => filter("category", c)}
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
      <div className="market-controls">
        <label>
          Sort listings
          <select
            aria-label="Sort listings"
            value={sort}
            onChange={(e) => filter("sort", e.target.value)}
          >
            <option value="newest">Newest first</option>
            <option value="price-asc">Sale price: low to high</option>
            <option value="price-desc">Sale price: high to low</option>
          </select>
        </label>
        {mine && (
          <label>
            Listing status
            <select
              aria-label="Listing status"
              value={status}
              onChange={(e) => filter("status", e.target.value)}
            >
              {[
                "all",
                "active",
                "reserved",
                "completed",
                "withdrawn",
                "removed",
              ].map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>
        )}
        {params.size > 0 && (
          <button className="text-button" onClick={() => setParams({})}>
            Clear filters
          </button>
        )}
      </div>
      <div className="result-caption" role="status">
        {items.length} {items.length === 1 ? "item" : "items"} · KITS Warangal
      </div>
      {items.length ? (
        <div className="listing-grid">
          {items.slice(0, visibleCount).map((l) => (
            <div key={l.id}>
              <ListingCard listing={l} />
              {mine && (
                <div className="under-card">
                  <Status>
                    {l.status === "completed"
                      ? l.mode === "sale"
                        ? "sold"
                        : l.mode === "swap"
                          ? "swapped"
                          : "donated"
                      : l.status}
                  </Status>
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
      {items.length > visibleCount && (
        <button
          className="button secondary load-more"
          onClick={() => setPage({ key: filterKey, count: visibleCount + 12 })}
        >
          Load more listings
        </button>
      )}
    </>
  );
}
function DemoListingDetail() {
  const { listingId } = useParams();
  const s = useDemo();
  const l = s.listings.find((l) => l.id === listingId);
  const navigate = useNavigate();
  const { error, run } = useAction();
  const [reason, setReason] = useState("");
  const [reporting, setReporting] = useState(false);
  const [notice, setNotice] = useState("");
  const [buyer, setBuyer] = useState("");
  const [handoverKey] = useState(() => crypto.randomUUID());
  const myDeal = s.deals?.find(
    (d) =>
      d.listingId === listingId &&
      d.status !== "cancelled" &&
      [d.sellerId, d.buyerId].includes(s.currentUserId),
  );
  if (
    !l ||
    l.campusId !== s.users.find((u) => u.id === s.currentUserId)?.campusId ||
    l.status === "removed" ||
    (["completed", "withdrawn"].includes(l.status) &&
      l.ownerId !== s.currentUserId &&
      !myDeal)
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
  const buyerIds = [
    ...new Set(
      s.conversations
        .filter(
          (c) =>
            c.contextType === "listing" &&
            c.contextId === l.id &&
            c.participantIds.includes(s.currentUserId),
        )
        .flatMap((c) =>
          c.participantIds.filter((id) => id !== s.currentUserId),
        ),
    ),
  ];
  const buyers = s.users.filter(
    (u) =>
      buyerIds.includes(u.id) &&
      u.campusId === l.campusId &&
      u.accountStatus === "active" &&
      u.verificationStatus === "verified",
  );
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
          <Status>
            {l.status === "completed"
              ? l.mode === "sale"
                ? "sold"
                : l.mode === "swap"
                  ? "swapped"
                  : "donated"
              : l.status}
          </Status>
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
          {myDeal && (
            <section
              className="panel handover-panel"
              aria-label="Item handover"
            >
              <h2>Item handover</h2>
              <p>
                {myDeal.status === "confirmed"
                  ? "Both students confirmed this handover."
                  : "Confirm only after you exchange the item. Both students must confirm."}
              </p>
              <p>
                Seller: {myDeal.sellerConfirmed ? "Confirmed" : "Waiting"} ·
                Buyer: {myDeal.buyerConfirmed ? "Confirmed" : "Waiting"}
              </p>
              {myDeal.status === "proposed" && (
                <div className="actions">
                  <button
                    className="button primary"
                    disabled={
                      own ? myDeal.sellerConfirmed : myDeal.buyerConfirmed
                    }
                    onClick={() =>
                      run(() => {
                        api.confirmDeal(myDeal.id, true);
                      })
                    }
                  >
                    Confirm handover
                  </button>
                  <button
                    className="button secondary"
                    onClick={() => {
                      if (
                        confirm(
                          "Cancel this handover and make the listing available?",
                        )
                      )
                        run(() => {
                          api.confirmDeal(myDeal.id, false);
                        });
                    }}
                  >
                    Cancel handover
                  </button>
                </div>
              )}
            </section>
          )}
          {own ? (
            <div className="stack">
              {["active", "reserved"].includes(l.status) &&
                !l.pendingDealId && (
                  <>
                    <Link
                      className="button primary"
                      to={`/xchange/${l.id}/edit`}
                    >
                      Edit listing
                    </Link>
                    <button
                      className="button secondary"
                      onClick={() =>
                        run(() =>
                          api.setListingStatus(
                            l.id,
                            l.status === "active" ? "reserved" : "active",
                            l.updatedAt,
                          ),
                        )
                      }
                    >
                      {l.status === "active"
                        ? "Reserve item"
                        : "Make available"}
                    </button>
                    <button
                      className="button secondary"
                      onClick={() =>
                        run(() => {
                          if (
                            confirm(
                              "Mark this item completed? This is self-reported, not a confirmed handover.",
                            )
                          )
                            api.setListingStatus(
                              l.id,
                              "completed",
                              l.updatedAt,
                            );
                        })
                      }
                    >
                      Mark{" "}
                      {l.mode === "sale"
                        ? "sold"
                        : l.mode === "donation"
                          ? "donated"
                          : "swapped"}
                    </button>
                    {buyers.length > 0 && (
                      <form
                        className="handover-proposal"
                        onSubmit={(e) => {
                          e.preventDefault();
                          run(() => {
                            api.proposeDeal(l.id, buyer, handoverKey);
                          });
                        }}
                      >
                        <label>
                          Student for handover
                          <select
                            aria-label="Student for handover"
                            required
                            value={buyer}
                            onChange={(e) => setBuyer(e.target.value)}
                          >
                            <option value="">
                              Choose a student from your conversations
                            </option>
                            {buyers.map((u) => (
                              <option key={u.id} value={u.id}>
                                {u.displayName}
                              </option>
                            ))}
                          </select>
                        </label>
                        <button className="button secondary">
                          Propose handover
                        </button>
                      </form>
                    )}
                    <button
                      className="text-button"
                      onClick={() => {
                        if (confirm("Withdraw this listing?"))
                          run(() =>
                            api.setListingStatus(
                              l.id,
                              "withdrawn",
                              l.updatedAt,
                            ),
                          );
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
function DemoListingForm() {
  const { listingId } = useParams();
  const s = useDemo();
  const existing = s.listings.find((l) => l.id === listingId);
  const navigate = useNavigate();
  const { error, setError, run } = useAction();
  const [mode, setMode] = useState<ListingMode>(existing?.mode ?? "sale");
  const [images, setImages] = useState<string[]>(
    existing?.imagePaths.filter((p) => !p.startsWith("demo:")) ?? [],
  );
  const [submitting, setSubmitting] = useState(false);
  const [expectedVersion] = useState(existing?.updatedAt);
  const [uploading, setUploading] = useState(false);
  const [key] = useState(() => crypto.randomUUID());
  if (
    listingId &&
    (!existing ||
      existing.ownerId !== s.currentUserId ||
      existing.campusId !==
        s.users.find((u) => u.id === s.currentUserId)?.campusId ||
      !["active", "reserved"].includes(existing.status) ||
      existing.pendingDealId)
  )
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
    if (uploading || submitting) return;
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
      imagePaths: images.length ? images : [`demo:${f.get("category")}`],
      idempotencyKey: key,
    };
    setSubmitting(true);
    run(() => {
      if (existing) {
        api.updateListing(existing.id, input, expectedVersion!);
        navigate(`/xchange/${existing.id}`);
      } else {
        const result = api.createListing(input);
        navigate(`/xchange/${result.listingId}`);
      }
    });
    setSubmitting(false);
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
                max="1000000"
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
          Item photos{" "}
          <span className="label-note">
            Up to five JPG, PNG or WebP images, 5 MB each. A category
            illustration is available in the local demo.
          </span>
          <input
            type="file"
            aria-label="Item photos"
            accept="image/jpeg,image/png,image/webp"
            multiple
            disabled={uploading || images.length >= 5}
            onChange={async (e) => {
              const files = Array.from(e.target.files ?? []);
              e.target.value = "";
              if (!files.length) return;
              if (files.length + images.length > 5) {
                setError("Use at most five photos.");
                return;
              }
              setUploading(true);
              setError("");
              try {
                const converted = await Promise.all(files.map(compressImage));
                const paths = converted.map((data) => api.saveImage(data));
                setImages((old) => [...old, ...paths]);
              } catch (err) {
                setError(errorText(err));
              } finally {
                setUploading(false);
              }
            }}
          />
        </label>
        {uploading && <p role="status">Preparing photos…</p>}
        <div className="photo-previews">
          {images.map((path, i) => (
            <div key={path}>
              <img src={s.images[path]} alt={`Item photo ${i + 1}`} />
              <button
                type="button"
                className="text-button"
                disabled={uploading}
                onClick={() =>
                  setImages((old) => old.filter((p) => p !== path))
                }
              >
                Remove photo {i + 1}
              </button>
            </div>
          ))}
        </div>
        <div className="form-footer">
          <Link to="/xchange">Cancel</Link>
          <button disabled={uploading || submitting} className="button primary">
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
