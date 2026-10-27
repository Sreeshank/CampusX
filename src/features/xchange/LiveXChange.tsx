import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { BookOpen, Heart, Plus } from "lucide-react";
import type {
  CreateListingInput,
  Listing,
  ListingStatus,
} from "../../../shared/types";
import { CATEGORIES, CONDITIONS } from "../../../shared/constants";
import { listingSchema, errorText } from "../../../shared/validation";
import { Avatar, Empty, ErrorBox, PageHead, Status } from "../../components/ui";
import { money } from "../../lib/format";
import type {
  createFirebaseXChangeRepository,
  ListingFilters,
} from "./firebaseRepository";

export type XChangeRepository = ReturnType<
  typeof createFirebaseXChangeRepository
>;
interface Session {
  uid: string;
  campusId: string;
  displayName: string;
}
interface Runtime {
  user: Session;
  repository: XChangeRepository;
  savedIds: ReadonlySet<string>;
  setSaved: (id: string, value: boolean) => void;
}
const RuntimeContext = createContext<Runtime | null>(null);
/** Person 2 mounts this inside real Auth/campus guards. No Firebase-to-demo fallback. */
export function XChangeLiveProvider({
  user,
  repository,
  savedIds = [],
  children,
}: {
  user: Session;
  repository: XChangeRepository;
  savedIds?: string[];
  children: ReactNode;
}) {
  const [saved, setSaved] = useState(new Set(savedIds));
  const savedKey = savedIds.join("|");
  useEffect(
    () => setSaved(new Set(savedKey ? savedKey.split("|") : [])),
    [user.uid, savedKey],
  );
  return (
    <RuntimeContext.Provider
      key={user.uid}
      value={{
        user,
        repository,
        savedIds: saved,
        setSaved: (id, value) =>
          setSaved((old) => {
            const next = new Set(old);
            if (value) next.add(id);
            else next.delete(id);
            return next;
          }),
      }}
    >
      {children}
    </RuntimeContext.Provider>
  );
}
export const useLiveXChange = () => useContext(RuntimeContext);
function useTask() {
  const lock = useRef(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function run(fn: () => Promise<void>) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      await fn();
    } catch (e) {
      setError(errorText(e));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return { busy, error, run, setError };
}
function LivePhoto({
  paths,
  title,
  large = false,
}: {
  paths: string[];
  title: string;
  large?: boolean;
}) {
  const { repository } = useLiveXChange()!,
    [selected, setSelected] = useState(0),
    [source, setSource] = useState(""),
    [error, setError] = useState(false);
  const path = paths[Math.min(selected, paths.length - 1)];
  useEffect(() => {
    let alive = true,
      ownedSource = "";
    setSource("");
    setError(false);
    if (path)
      repository
        .imageSource(path)
        .then((src) => {
          ownedSource = src;
          if (alive) setSource(src);
          else if (src.startsWith("blob:")) URL.revokeObjectURL(src);
        })
        .catch(() => {
          if (alive) setError(true);
        });
    return () => {
      alive = false;
      if (ownedSource.startsWith("blob:")) URL.revokeObjectURL(ownedSource);
    };
  }, [repository, path]);
  return (
    <div className="product-gallery">
      <div className={`product-art ${large ? "art-large" : ""}`}>
        {source && !error ? (
          <img src={source} alt={title} onError={() => setError(true)} />
        ) : (
          <>
            <BookOpen aria-hidden="true" />
            <span className="art-caption">
              {error ? "Photo unavailable" : "Loading photo…"}
            </span>
          </>
        )}
      </div>
      {large && paths.length > 1 && (
        <div className="gallery-thumbnails">
          {paths.map((p, i) => (
            <button
              key={p}
              aria-label={`View photo ${i + 1}`}
              aria-pressed={selected === i}
              onClick={() => setSelected(i)}
            >
              Photo {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
export function LiveListingCard({ listing }: { listing: Listing }) {
  const r = useLiveXChange()!,
    task = useTask(),
    saved = r.savedIds.has(listing.id);
  return (
    <article className="listing-card">
      <div className="card-image">
        <Link to={`/xchange/${listing.id}`}>
          <LivePhoto paths={listing.imagePaths} title={listing.title} />
        </Link>
        <button
          className={`save-button ${saved ? "saved" : ""}`}
          disabled={task.busy}
          aria-label={`${saved ? "Unsave" : "Save"} ${listing.title}`}
          onClick={() =>
            task.run(async () => {
              await r.repository.setSavedListing({
                listingId: listing.id,
                saved: !saved,
              });
              r.setSaved(listing.id, !saved);
            })
          }
        >
          <Heart size={18} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="card-body">
        <Link className="card-title" to={`/xchange/${listing.id}`}>
          {listing.title}
        </Link>
        <div className="card-bottom">
          <strong>{money(listing.pricePaise)}</strong>
          <Status>{listing.status}</Status>
        </div>
        <ErrorBox message={task.error} />
      </div>
    </article>
  );
}
export function LiveMarketplace({
  mine = false,
  saved = false,
}: {
  mine?: boolean;
  saved?: boolean;
}) {
  const r = useLiveXChange()!,
    [params, setParams] = useSearchParams(),
    [items, setItems] = useState<Listing[]>([]),
    [cursor, setCursor] = useState<string | null>(null),
    [loading, setLoading] = useState(true),
    [reload, setReload] = useState(0),
    task = useTask(),
    generation = useRef(0);
  const key = JSON.stringify([
    params.toString(),
    r.user.uid,
    mine,
    saved,
    reload,
  ]);
  const filters: ListingFilters = {
    scope: mine ? "mine" : "feed",
    pageSize: 20,
    ...(params.get("q") ? { prefix: params.get("q")! } : {}),
    ...(params.get("category") ? { category: params.get("category")! } : {}),
    ...(params.get("mode")
      ? { mode: params.get("mode") as ListingFilters["mode"] }
      : {}),
    ...(params.get("sort")
      ? { sort: params.get("sort") as ListingFilters["sort"] }
      : {}),
    ...(mine && params.get("status")
      ? { status: params.get("status") as ListingStatus }
      : {}),
  };
  const fetchPage = (next?: string | null) =>
    saved
      ? r.repository.listSavedListings(next)
      : r.repository.listListings({ ...filters, cursor: next });
  useEffect(() => {
    const token = ++generation.current;
    setLoading(true);
    setItems([]);
    setCursor(null);
    task.setError("");
    fetchPage()
      .then((page) => {
        if (token === generation.current) {
          setItems(page.items);
          setCursor(page.nextCursor);
        }
      })
      .catch((e) => {
        if (token === generation.current) task.setError(errorText(e));
      })
      .finally(() => {
        if (token === generation.current) setLoading(false);
      });
    return () => {
      generation.current++;
    };
  }, [r.repository, key]);
  function change(field: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(field, value);
    else next.delete(field);
    if (field === "q") next.delete("sort");
    if (field === "sort" && value !== "newest") {
      next.delete("q");
      next.set("mode", "sale");
    }
    if (field === "mode" && value !== "sale") next.delete("sort");
    setParams(next, { replace: true });
  }
  return (
    <>
      <PageHead
        eyebrow="XCHANGE"
        title={mine ? "Your listings" : saved ? "Saved for later" : "XChange"}
        description="Buy, sell, swap and donate within your campus."
      >
        <Link className="button primary" to="/xchange/new">
          <Plus size={18} />
          Post an item
        </Link>
      </PageHead>
      <div className="tabs">
        <Link to="/xchange">Discover</Link>
        <Link to="/my-listings">My listings</Link>
        <Link to="/saved">Saved items</Link>
      </div>
      {!saved && (
        <div className="market-controls">
          <label>
            Search listings
            <input
              value={params.get("q") ?? ""}
              onChange={(e) => change("q", e.target.value)}
              placeholder="Search by title prefix"
            />
          </label>
          <label>
            Category
            <select
              value={params.get("category") ?? ""}
              onChange={(e) => change("category", e.target.value)}
            >
              <option value="">All categories</option>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            Exchange type
            <select
              value={params.get("mode") ?? ""}
              onChange={(e) => change("mode", e.target.value)}
            >
              <option value="">All exchanges</option>
              {["sale", "swap", "donation"].map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </label>
          <label>
            Sort listings
            <select
              value={params.get("sort") ?? "newest"}
              onChange={(e) => change("sort", e.target.value)}
            >
              <option value="newest">Newest / title prefix</option>
              <option value="price-asc">Sale price: low to high</option>
              <option value="price-desc">Sale price: high to low</option>
            </select>
          </label>
          {mine && (
            <label>
              Listing status
              <select
                value={params.get("status") ?? ""}
                onChange={(e) => change("status", e.target.value)}
              >
                <option value="">All statuses</option>
                {[
                  "active",
                  "reserved",
                  "completed",
                  "withdrawn",
                  "removed",
                ].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
          )}
          <button className="text-button" onClick={() => setParams({})}>
            Clear filters
          </button>
        </div>
      )}
      <ErrorBox message={task.error} />
      {loading ? (
        <p role="status">Loading campus listings…</p>
      ) : !items.length ? (
        <Empty
          title={
            task.error
              ? "Listings could not be loaded"
              : "Nothing here just yet"
          }
          text="Try another filter or refresh to retry."
        />
      ) : (
        <div className="listing-grid">
          {items.map((l) => (
            <LiveListingCard key={l.id} listing={l} />
          ))}
        </div>
      )}
      {!loading && task.error && (
        <button
          className="button secondary"
          onClick={() => setReload((v) => v + 1)}
        >
          Retry listings
        </button>
      )}
      {cursor && (
        <button
          className="button secondary load-more"
          disabled={task.busy}
          onClick={() => {
            const token = generation.current;
            task.run(async () => {
              const page = await fetchPage(cursor);
              if (token !== generation.current) return;
              setItems((old) => [
                ...old,
                ...page.items.filter((l) => !old.some((p) => p.id === l.id)),
              ]);
              setCursor(page.nextCursor);
            });
          }}
        >
          {task.busy ? "Loading…" : "Load more listings"}
        </button>
      )}
    </>
  );
}
export function LiveListingDetail() {
  const r = useLiveXChange()!,
    { listingId } = useParams(),
    [result, setResult] = useState<Awaited<
      ReturnType<XChangeRepository["getListing"]>
    > | null>(null),
    [loading, setLoading] = useState(true),
    [version, setVersion] = useState(0),
    task = useTask(),
    navigate = useNavigate(),
    [buyerId, setBuyerId] = useState(""),
    [reason, setReason] = useState(""),
    [reporting, setReporting] = useState(false),
    [notice, setNotice] = useState(""),
    [dealKey] = useState(() => crypto.randomUUID()),
    [reportKey] = useState(() => crypto.randomUUID());
  useEffect(() => {
    let alive = true;
    setLoading(true);
    task.setError("");
    r.repository
      .getListing(listingId!)
      .then((value) => {
        if (alive) setResult(value);
      })
      .catch((e) => {
        if (alive) {
          setResult(null);
          task.setError(errorText(e));
        }
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [r.repository, listingId, version]);
  if (loading) return <p role="status">Loading listing…</p>;
  if (!result)
    return (
      <>
        <ErrorBox message={task.error} />
        <Empty
          title="Item unavailable"
          text="This listing may be closed, removed, or unavailable to your account."
          href="/xchange"
          action="Back to XChange"
        />
        <button
          className="button secondary"
          onClick={() => setVersion((v) => v + 1)}
        >
          Retry listing
        </button>
      </>
    );
  const { listing: l, seller, deal, contacts } = result,
    own = l.ownerId === r.user.uid;
  const status = async (next: ListingStatus) => {
    await r.repository.setListingStatus({
      listingId: l.id,
      status: next,
      expectedUpdatedAt: l.updatedAt,
    });
    setVersion((v) => v + 1);
  };
  return (
    <>
      <Link className="back-link" to="/xchange">
        Back to XChange
      </Link>
      <div className="detail-grid">
        <LivePhoto paths={l.imagePaths} title={l.title} large />
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
          {l.mode === "swap" && <p>Looking for: {l.swapWanted}</p>}
          <div className="seller">
            <Avatar name={seller?.displayName ?? "Campus member"} />
            <div>
              <strong>{seller?.displayName ?? "Campus member"}</strong>
              <small>{seller?.department}</small>
            </div>
          </div>
          <ErrorBox message={task.error} />
          {notice && <p role="status">{notice}</p>}
          {deal && (
            <section className="panel">
              <h2>Item handover</h2>
              <p>
                {deal.status === "confirmed"
                  ? "Both students confirmed this handover."
                  : "Confirm after exchanging the item. Both students must confirm."}
              </p>
              <p>
                Seller: {deal.sellerConfirmed ? "Confirmed" : "Waiting"} ·
                Buyer: {deal.buyerConfirmed ? "Confirmed" : "Waiting"}
              </p>
              {deal.status === "proposed" && (
                <div className="actions">
                  <button
                    className="button primary"
                    disabled={
                      task.busy ||
                      (own ? deal.sellerConfirmed : deal.buyerConfirmed)
                    }
                    onClick={() =>
                      task.run(async () => {
                        await r.repository.confirmDeal({
                          dealId: deal.id,
                          confirm: true,
                        });
                        setVersion((v) => v + 1);
                      })
                    }
                  >
                    Confirm handover
                  </button>
                  <button
                    className="button secondary"
                    disabled={task.busy}
                    onClick={() => {
                      if (confirm("Cancel this handover?"))
                        task.run(async () => {
                          await r.repository.confirmDeal({
                            dealId: deal.id,
                            confirm: false,
                          });
                          setVersion((v) => v + 1);
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
            ["active", "reserved"].includes(l.status) &&
            !l.pendingDealId && (
              <div className="stack">
                <Link className="button primary" to={`/xchange/${l.id}/edit`}>
                  Edit listing
                </Link>
                <button
                  className="button secondary"
                  disabled={task.busy}
                  onClick={() =>
                    task.run(() =>
                      status(l.status === "active" ? "reserved" : "active"),
                    )
                  }
                >
                  {l.status === "active" ? "Reserve item" : "Make available"}
                </button>
                <button
                  className="button secondary"
                  disabled={task.busy}
                  onClick={() => {
                    if (
                      confirm(
                        "Mark completed? This is self-reported completion.",
                      )
                    )
                      task.run(() => status("completed"));
                  }}
                >
                  Mark completed
                </button>
                <button
                  className="text-button"
                  disabled={task.busy}
                  onClick={() => {
                    if (confirm("Withdraw this listing?"))
                      task.run(() => status("withdrawn"));
                  }}
                >
                  Withdraw listing
                </button>
                {contacts.length > 0 && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      task.run(async () => {
                        await r.repository.proposeDeal({
                          listingId: l.id,
                          buyerId,
                          idempotencyKey: dealKey,
                        });
                        setVersion((v) => v + 1);
                      });
                    }}
                  >
                    <label>
                      Student for handover
                      <select
                        required
                        value={buyerId}
                        onChange={(e) => setBuyerId(e.target.value)}
                      >
                        <option value="">
                          Choose a student from your conversations
                        </option>
                        {contacts.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.displayName}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button className="button secondary" disabled={task.busy}>
                      Propose handover
                    </button>
                  </form>
                )}
              </div>
            )
          ) : (
            <>
              <button
                className="button primary full"
                disabled={task.busy || l.status !== "active"}
                onClick={() =>
                  task.run(async () => {
                    const c = await r.repository.openConversation({
                      contextType: "listing",
                      contextId: l.id,
                      otherUserId: l.ownerId,
                    });
                    navigate(`/messages/${c.conversationId}`);
                  })
                }
              >
                Message seller
              </button>
              <button
                className="text-button"
                onClick={() => setReporting(!reporting)}
              >
                Report listing
              </button>
              {reporting && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    task.run(async () => {
                      await r.repository.submitReport({
                        targetType: "listing",
                        targetId: l.id,
                        reason: "other",
                        details: reason,
                        idempotencyKey: reportKey,
                      });
                      setNotice("Report submitted.");
                      setReporting(false);
                    });
                  }}
                >
                  <label>
                    Describe the concern
                    <textarea
                      required
                      minLength={5}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                  </label>
                  <button className="button secondary" disabled={task.busy}>
                    Submit report
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
export function LiveListingForm() {
  const r = useLiveXChange()!,
    { listingId } = useParams(),
    [existing, setExisting] = useState<Listing | null>(null),
    [loading, setLoading] = useState(Boolean(listingId)),
    [images, setImages] = useState<string[]>([]),
    [mode, setMode] = useState<CreateListingInput["mode"]>("sale"),
    task = useTask(),
    [uploading, setUploading] = useState(false),
    [uploadError, setUploadError] = useState(""),
    [key] = useState(() => crypto.randomUUID()),
    navigate = useNavigate();
  useEffect(() => {
    if (!listingId) return;
    let alive = true;
    r.repository
      .getListing(listingId)
      .then(({ listing: l }) => {
        if (alive) {
          setExisting(l);
          setImages(l.imagePaths);
          setMode(l.mode);
        }
      })
      .catch((e) => {
        if (alive) task.setError(errorText(e));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [r.repository, listingId]);
  if (loading) return <p role="status">Loading your listing…</p>;
  if (
    listingId &&
    (!existing ||
      existing.ownerId !== r.user.uid ||
      !["active", "reserved"].includes(existing.status) ||
      existing.pendingDealId)
  )
    return (
      <>
        <ErrorBox message={task.error} />
        <Empty
          title="You cannot edit this listing"
          text="Open an active or reserved listing that you own."
          href="/my-listings"
          action="My listings"
        />
      </>
    );
  return (
    <>
      <PageHead
        eyebrow="XCHANGE"
        title={existing ? "Edit your listing" : "Something to pass on?"}
        description="Add accurate details and 1–5 photos."
      />
      <form
        className="form-card"
        onSubmit={(e) => {
          e.preventDefault();
          if (uploading) return;
          const f = new FormData(e.currentTarget);
          task.run(async () => {
            if (uploadError)
              throw Error("Resolve the photo upload error before publishing.");
            const input = listingSchema.parse({
              title: f.get("title"),
              description: f.get("description"),
              category: f.get("category"),
              condition: f.get("condition"),
              mode,
              pricePaise:
                mode === "swap"
                  ? null
                  : mode === "donation"
                    ? 0
                    : Math.round(Number(f.get("price")) * 100),
              swapWanted: String(f.get("swapWanted") ?? ""),
              imagePaths: images,
              idempotencyKey: key,
            });
            if (existing) {
              const { idempotencyKey: _, ...patch } = input;
              await r.repository.updateListing({
                listingId: existing.id,
                patch,
                expectedUpdatedAt: existing.updatedAt,
              });
              navigate(`/xchange/${existing.id}`);
            } else {
              const result = await r.repository.createListing(input);
              navigate(`/xchange/${result.listingId}`);
            }
          });
        }}
      >
        <ErrorBox message={task.error || uploadError} />
        <div className="form-grid">
          <label>
            Item title
            <input
              name="title"
              required
              minLength={3}
              maxLength={100}
              defaultValue={existing?.title}
            />
          </label>
          <label>
            Exchange type
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as typeof mode)}
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
                name="price"
                type="number"
                required
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
                name="swapWanted"
                required
                maxLength={200}
                defaultValue={existing?.swapWanted}
              />
            </label>
          )}
        </div>
        <label>
          Description
          <textarea
            name="description"
            required
            minLength={10}
            maxLength={2000}
            defaultValue={existing?.description}
          />
        </label>
        <label>
          Item photos
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            disabled={uploading || task.busy || images.length >= 5}
            onChange={async (e) => {
              const files = Array.from(e.target.files ?? []);
              e.target.value = "";
              if (!files.length) return;
              if (files.length + images.length > 5) {
                setUploadError("Use at most five photos.");
                return;
              }
              setUploading(true);
              setUploadError("");
              try {
                const paths = await r.repository.uploadPhotos(files);
                setImages((old) => [...old, ...paths]);
              } catch (e) {
                setUploadError(errorText(e));
              } finally {
                setUploading(false);
              }
            }}
          />
        </label>
        {uploadError && (
          <button
            type="button"
            className="text-button"
            onClick={() => setUploadError("")}
          >
            Keep existing photos and clear upload error
          </button>
        )}
        {uploading && <p role="status">Uploading photos…</p>}
        <div className="photo-previews">
          {images.map((path, i) => (
            <div key={path}>
              <LivePhoto paths={[path]} title={`Item photo ${i + 1}`} />
              <button
                type="button"
                className="text-button"
                disabled={uploading || task.busy}
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
          <Link to="/my-listings">Cancel</Link>
          <button
            className="button primary"
            disabled={
              task.busy ||
              uploading ||
              images.length < 1 ||
              Boolean(uploadError)
            }
          >
            {task.busy
              ? "Saving…"
              : existing
                ? "Save changes"
                : "Publish listing"}
          </button>
        </div>
      </form>
    </>
  );
}
