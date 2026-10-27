import { createHash } from "node:crypto";
import {
  FieldPath,
  Timestamp,
  type Firestore,
  type Transaction,
} from "firebase-admin/firestore";
import { HttpsError } from "firebase-functions/v2/https";
import {
  contentFields,
  docId,
  editable,
  eligible,
  listingContent,
  object,
  only,
  owner,
  retryKey,
  text,
  transition,
  categories,
} from "./policy";

const hash = (v: unknown) =>
  createHash("sha256").update(JSON.stringify(v)).digest("hex");
function canonical(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(canonical);
  if (v && typeof v === "object")
    return Object.fromEntries(
      Object.entries(v)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, x]) => [k, canonical(x)]),
    );
  return v;
}
const serialize = (id: string, v: Record<string, unknown>) => ({
  id,
  ...Object.fromEntries(
    [
      "ownerId",
      "campusId",
      ...contentFields,
      "titleNormalized",
      "status",
      "pendingDealId",
      "confirmedDealId",
    ]
      .filter((k) => v[k] !== undefined)
      .map((k) => [k, v[k]]),
  ),
  createdAt: (v.createdAt as Timestamp).toDate().toISOString(),
  updatedAt: (v.updatedAt as Timestamp).toDate().toISOString(),
});
export class XChangeService {
  constructor(
    private db: Firestore,
    private verifyImages: (paths: string[]) => Promise<void>,
  ) {}
  private async member(uid: string, tx?: Transaction) {
    const ref = this.db.doc(`users/${uid}`);
    return eligible((tx ? await tx.get(ref) : await ref.get()).data());
  }
  private async rate(
    tx: Transaction,
    uid: string,
    operation: string,
    limit = 30,
  ) {
    const ref = this.db.doc(`xchangeRateLimits/${hash(uid + operation)}`),
      snap = await tx.get(ref),
      v = snap.data();
    const now = Date.now(),
      fresh = !v || now - v.start.toMillis() >= 60_000;
    if (!fresh && v.count >= limit)
      throw new HttpsError(
        "resource-exhausted",
        "Too many actions. Wait a minute and retry.",
      );
    return () =>
      tx.set(ref, {
        start: fresh ? Timestamp.fromMillis(now) : v!.start,
        count: fresh ? 1 : v!.count + 1,
        expiresAt: Timestamp.fromMillis(now + 120_000),
      });
  }
  private receipt(uid: string, key: string) {
    return this.db.doc(`operations/${hash(uid)}_${key}`);
  }
  private replay(
    data: Record<string, unknown> | undefined,
    operation: string,
    payloadHash: string,
  ) {
    if (!data) return undefined;
    if (data.operation !== operation || data.payloadHash !== payloadHash)
      throw new HttpsError(
        "already-exists",
        "Retry key was used for a different action.",
      );
    return data.result as Record<string, unknown>;
  }
  private saveReceipt(
    tx: Transaction,
    uid: string,
    key: string,
    operation: string,
    payloadHash: string,
    result: unknown,
  ) {
    tx.create(this.receipt(uid, key), {
      operation,
      payloadHash,
      result,
      createdAt: Timestamp.now(),
      expiresAt: Timestamp.fromMillis(Date.now() + 7 * 86400_000),
    });
  }
  private nextTime(item?: Record<string, unknown>) {
    return Timestamp.fromMillis(
      Math.max(
        Date.now(),
        ((item?.updatedAt as Timestamp)?.toMillis?.() ?? 0) + 1,
      ),
    );
  }
  async create(uid: string, input: unknown) {
    const v = object(input);
    only(v, [...contentFields, "idempotencyKey"]);
    const key = retryKey(v.idempotencyKey),
      { idempotencyKey: _, ...fields } = v;
    const content = listingContent(fields, uid),
      digest = hash(canonical(content));
    await this.member(uid);
    const previous = this.replay(
      (await this.receipt(uid, key).get()).data(),
      "createListing",
      digest,
    );
    if (previous) return previous;
    await this.verifyImages(content.imagePaths);
    const ref = this.db.collection("listings").doc();
    return this.db.runTransaction(async (tx) => {
      const campusId = await this.member(uid, tx),
        receipt = await tx.get(this.receipt(uid, key));
      const replay = this.replay(receipt.data(), "createListing", digest);
      if (replay) return replay;
      const charge = await this.rate(tx, uid, "create", 10),
        at = this.nextTime();
      tx.create(ref, {
        ...content,
        ownerId: uid,
        campusId,
        status: "active",
        createdAt: at,
        updatedAt: at,
      });
      const result = { listingId: ref.id };
      this.saveReceipt(tx, uid, key, "createListing", digest, result);
      charge();
      return result;
    });
  }
  async update(uid: string, input: unknown) {
    const v = object(input);
    only(v, ["listingId", "patch", "expectedUpdatedAt"]);
    const id = docId(v.listingId, "listingId"),
      patch = object(v.patch);
    only(patch, contentFields);
    if (!Object.keys(patch).length)
      throw new HttpsError(
        "invalid-argument",
        "Provide at least one editable field.",
      );
    const campus = await this.member(uid),
      old = owner(
        (await this.db.doc(`listings/${id}`).get()).data(),
        uid,
        campus,
      );
    editable(old, v.expectedUpdatedAt);
    if (old.pendingDealId)
      throw new HttpsError(
        "failed-precondition",
        "Confirm or cancel the pending handover before editing.",
      );
    const fields = Object.fromEntries(
      contentFields.map((k) => [
        k,
        k === "swapWanted" ? (old[k] ?? "") : old[k],
      ]),
    );
    const content = listingContent({ ...fields, ...patch }, uid);
    await this.verifyImages(content.imagePaths);
    return this.db.runTransaction(async (tx) => {
      const campusId = await this.member(uid, tx),
        ref = this.db.doc(`listings/${id}`),
        snap = await tx.get(ref);
      const item = owner(snap.data(), uid, campusId);
      editable(item, v.expectedUpdatedAt);
      if (item.pendingDealId)
        throw new HttpsError(
          "failed-precondition",
          "Confirm or cancel the pending handover before editing.",
        );
      const charge = await this.rate(tx, uid, "update"),
        at = this.nextTime(item);
      tx.update(ref, { ...content, updatedAt: at });
      charge();
      return { listingId: id, updatedAt: at.toDate().toISOString() };
    });
  }
  async setStatus(uid: string, input: unknown) {
    const v = object(input);
    only(v, ["listingId", "status", "expectedUpdatedAt"]);
    const id = docId(v.listingId, "listingId");
    return this.db.runTransaction(async (tx) => {
      const campusId = await this.member(uid, tx),
        ref = this.db.doc(`listings/${id}`),
        snap = await tx.get(ref);
      const item = owner(snap.data(), uid, campusId);
      editable(item, v.expectedUpdatedAt);
      const status = transition(String(item.status), v.status),
        charge = await this.rate(tx, uid, "status");
      if (item.pendingDealId)
        throw new HttpsError(
          "failed-precondition",
          "Confirm or cancel the pending handover first.",
        );
      tx.update(ref, { status, updatedAt: this.nextTime(item) });
      charge();
      return { status };
    });
  }
  async proposeDeal(uid: string, input: unknown) {
    const v = object(input);
    only(v, ["listingId", "buyerId", "idempotencyKey"]);
    const listingId = docId(v.listingId, "listingId"),
      buyerId = docId(v.buyerId, "buyerId"),
      key = retryKey(v.idempotencyKey),
      digest = hash({ listingId, buyerId });
    if (buyerId === uid)
      throw new HttpsError("invalid-argument", "Choose another student.");
    const dealRef = this.db.collection("deals").doc();
    return this.db.runTransaction(async (tx) => {
      const campusId = await this.member(uid, tx),
        replay = this.replay(
          (await tx.get(this.receipt(uid, key))).data(),
          "proposeDeal",
          digest,
        );
      if (replay) return replay;
      const buyerCampus = await this.member(buyerId, tx),
        ref = this.db.doc(`listings/${listingId}`),
        snap = await tx.get(ref),
        item = owner(snap.data(), uid, campusId);
      const blockA = await tx.get(
          this.db.doc(`users/${uid}/blocks/${buyerId}`),
        ),
        blockB = await tx.get(this.db.doc(`users/${buyerId}/blocks/${uid}`));
      const conversations = await tx.get(
        this.db
          .collection("conversations")
          .where("contextType", "==", "listing")
          .where("contextId", "==", listingId)
          .where("participantIds", "array-contains", uid)
          .limit(100),
      );
      if (buyerCampus !== campusId || blockA.exists || blockB.exists)
        throw new HttpsError(
          "permission-denied",
          "This student is unavailable.",
        );
      if (
        !conversations.docs.some((d) => {
          const c = d.data();
          return (
            c.campusId === campusId &&
            c.participantIds.length === 2 &&
            c.participantIds.includes(buyerId)
          );
        })
      )
        throw new HttpsError(
          "failed-precondition",
          "Start a listing conversation with this student first.",
        );
      if (
        !["active", "reserved"].includes(String(item.status)) ||
        item.pendingDealId
      )
        throw new HttpsError(
          "failed-precondition",
          "Listing already has a handover or is closed.",
        );
      const charge = await this.rate(tx, uid, "deal", 20),
        at = this.nextTime(item);
      tx.create(dealRef, {
        listingId,
        sellerId: uid,
        buyerId,
        campusId,
        mode: item.mode,
        status: "proposed",
        sellerConfirmed: false,
        buyerConfirmed: false,
        createdAt: at,
      });
      tx.update(ref, {
        status: "reserved",
        pendingDealId: dealRef.id,
        updatedAt: at,
      });
      const result = { dealId: dealRef.id };
      this.saveReceipt(tx, uid, key, "proposeDeal", digest, result);
      charge();
      return result;
    });
  }
  async confirmDeal(uid: string, input: unknown) {
    const v = object(input);
    only(v, ["dealId", "confirm"]);
    const id = docId(v.dealId, "dealId");
    if (typeof v.confirm !== "boolean")
      throw new HttpsError("invalid-argument", "Choose confirm or cancel.");
    return this.db.runTransaction(async (tx) => {
      const campusId = await this.member(uid, tx),
        ref = this.db.doc(`deals/${id}`),
        snap = await tx.get(ref),
        deal = snap.data();
      if (
        !deal ||
        deal.campusId !== campusId ||
        ![deal.sellerId, deal.buyerId].includes(uid)
      )
        throw new HttpsError("permission-denied", "Handover unavailable.");
      if (deal.status !== "proposed") return { status: deal.status };
      const sellerCampus = v.confirm
          ? await this.member(deal.sellerId, tx)
          : campusId,
        buyerCampus = v.confirm
          ? await this.member(deal.buyerId, tx)
          : campusId;
      const itemRef = this.db.doc(`listings/${deal.listingId}`),
        item = (await tx.get(itemRef)).data();
      const blockA = await tx.get(
          this.db.doc(`users/${deal.sellerId}/blocks/${deal.buyerId}`),
        ),
        blockB = await tx.get(
          this.db.doc(`users/${deal.buyerId}/blocks/${deal.sellerId}`),
        );
      if (v.confirm && (blockA.exists || blockB.exists))
        throw new HttpsError("permission-denied", "This handover is blocked.");
      if (
        sellerCampus !== campusId ||
        buyerCampus !== campusId ||
        !item ||
        item.campusId !== campusId ||
        item.pendingDealId !== id ||
        item.ownerId !== deal.sellerId ||
        item.status !== "reserved"
      )
        throw new HttpsError(
          "failed-precondition",
          "Handover is no longer available.",
        );
      const charge = await this.rate(tx, uid, "confirm", 30),
        at = this.nextTime(item);
      const flags = {
        sellerConfirmed:
          deal.sellerConfirmed || (uid === deal.sellerId && v.confirm),
        buyerConfirmed:
          deal.buyerConfirmed || (uid === deal.buyerId && v.confirm),
      };
      const status = !v.confirm
        ? "cancelled"
        : flags.sellerConfirmed && flags.buyerConfirmed
          ? "confirmed"
          : "proposed";
      tx.update(ref, {
        ...flags,
        status,
        ...(status === "confirmed" ? { completedAt: at } : {}),
      });
      if (status !== "proposed")
        tx.update(itemRef, {
          status: status === "confirmed" ? "completed" : "active",
          pendingDealId: null,
          ...(status === "confirmed" ? { confirmedDealId: id } : {}),
          updatedAt: at,
        });
      charge();
      return { status };
    });
  }
  async get(uid: string, input: unknown) {
    const v = object(input);
    only(v, ["listingId"]);
    const id = docId(v.listingId, "listingId"),
      campusId = await this.member(uid),
      item = (await this.db.doc(`listings/${id}`).get()).data();
    if (!item || item.campusId !== campusId || item.status === "removed")
      throw new HttpsError("not-found", "Listing unavailable.");
    const handoverId = item.pendingDealId ?? item.confirmedDealId;
    const rawDeal =
      typeof handoverId === "string"
        ? (
            await this.db.doc(`deals/${docId(handoverId, "handoverId")}`).get()
          ).data()
        : null;
    const deal =
      rawDeal &&
      rawDeal.campusId === campusId &&
      rawDeal.listingId === id &&
      [rawDeal.sellerId, rawDeal.buyerId].includes(uid)
        ? {
            id: handoverId,
            ...rawDeal,
            createdAt: rawDeal.createdAt.toDate().toISOString(),
            ...(rawDeal.completedAt
              ? { completedAt: rawDeal.completedAt.toDate().toISOString() }
              : {}),
          }
        : null;
    if (
      item.ownerId !== uid &&
      !deal &&
      !["active", "reserved"].includes(item.status)
    )
      throw new HttpsError("not-found", "Listing unavailable.");
    const p = (
      await this.db.doc(`publicProfiles/${item.ownerId}`).get()
    ).data();
    const seller =
      p && p.campusId === campusId
        ? {
            id: item.ownerId,
            displayName: p.displayName,
            department: p.department ?? "",
            year: p.year ?? "",
            verificationStatus: p.verificationStatus,
          }
        : null;
    const contacts: { id: string; displayName: string }[] = [];
    if (item.ownerId === uid && ["active", "reserved"].includes(item.status)) {
      const conversations = await this.db
        .collection("conversations")
        .where("contextType", "==", "listing")
        .where("contextId", "==", id)
        .where("participantIds", "array-contains", uid)
        .limit(30)
        .get();
      const candidates = [
        ...new Set(
          conversations.docs
            .filter((d) => d.get("campusId") === campusId)
            .flatMap((d) =>
              (d.get("participantIds") as string[]).filter((p) => p !== uid),
            ),
        ),
      ].slice(0, 30);
      const profiles = await Promise.all(
        candidates.map(async (candidate) => ({
          id: candidate,
          profile: (
            await this.db
              .doc(`publicProfiles/${docId(candidate, "contact")}`)
              .get()
          ).data(),
        })),
      );
      for (const p of profiles)
        if (
          p.profile?.campusId === campusId &&
          p.profile.verificationStatus === "verified"
        )
          contacts.push({ id: p.id, displayName: p.profile.displayName });
    }
    return { listing: serialize(id, item), seller, deal, contacts };
  }
  async list(uid: string, input: unknown) {
    const v = object(input ?? {});
    only(v, [
      "scope",
      "category",
      "mode",
      "prefix",
      "sort",
      "status",
      "cursor",
      "pageSize",
    ]);
    const campusId = await this.member(uid),
      scope = v.scope ?? "feed",
      sort = v.sort ?? "newest",
      prefix =
        v.prefix === undefined
          ? ""
          : text(v.prefix, "prefix", 0, 100).normalize("NFKC").toLowerCase();
    if (
      typeof scope !== "string" ||
      !["feed", "mine"].includes(scope) ||
      typeof sort !== "string" ||
      !["newest", "price-asc", "price-desc"].includes(sort)
    )
      throw new HttpsError("invalid-argument", "Unsupported query.");
    if (prefix && sort !== "newest")
      throw new HttpsError(
        "invalid-argument",
        "Prefix search uses title order. Clear search before sorting by price.",
      );
    if (
      v.category !== undefined &&
      (typeof v.category !== "string" || !categories.includes(v.category))
    )
      throw new HttpsError("invalid-argument", "Invalid category.");
    if (
      v.mode !== undefined &&
      (typeof v.mode !== "string" ||
        !["sale", "swap", "donation"].includes(v.mode))
    )
      throw new HttpsError("invalid-argument", "Invalid mode.");
    if (
      v.status !== undefined &&
      (typeof v.status !== "string" ||
        scope !== "mine" ||
        !["active", "reserved", "completed", "withdrawn", "removed"].includes(
          String(v.status),
        ))
    )
      throw new HttpsError("invalid-argument", "Invalid status filter.");
    if (sort !== "newest" && v.mode !== "sale")
      throw new HttpsError(
        "invalid-argument",
        "Price sorting is available for sale items only.",
      );
    const size = v.pageSize ?? 20;
    if (
      typeof size !== "number" ||
      !Number.isInteger(size) ||
      size < 1 ||
      size > 40
    )
      throw new HttpsError("invalid-argument", "Invalid page size.");
    let q = this.db.collection("listings").where("campusId", "==", campusId);
    q =
      scope === "mine"
        ? q.where("ownerId", "==", uid)
        : q.where("status", "==", "active");
    if (scope === "mine" && v.status) q = q.where("status", "==", v.status);
    if (v.category) q = q.where("category", "==", v.category);
    if (v.mode) q = q.where("mode", "==", v.mode);
    const field = prefix
        ? "titleNormalized"
        : sort === "newest"
          ? "createdAt"
          : "pricePaise",
      direction = sort === "price-asc" || prefix ? "asc" : "desc";
    if (prefix)
      q = q
        .where("titleNormalized", ">=", prefix)
        .where("titleNormalized", "<", prefix + "\uf8ff");
    q = q.orderBy(field, direction).orderBy(FieldPath.documentId(), direction);
    const scopeHash = hash({
      uid,
      campusId,
      scope,
      category: v.category ?? null,
      mode: v.mode ?? null,
      prefix,
      sort,
      status: v.status ?? null,
    });
    if (v.cursor) {
      if (typeof v.cursor !== "string" || v.cursor.length > 2048)
        throw new HttpsError("invalid-argument", "Invalid cursor.");
      try {
        const c = JSON.parse(Buffer.from(v.cursor, "base64url").toString());
        if (c.scope !== scopeHash) throw Error();
        const id = docId(c.id, "cursor");
        let value: unknown = c.value;
        if (field === "createdAt") {
          if (!Number.isSafeInteger(value)) throw Error();
          value = Timestamp.fromMillis(value as number);
        } else if (field === "pricePaise") {
          if (typeof value !== "number" || !Number.isSafeInteger(value))
            throw Error();
        } else if (typeof value !== "string" || value.length > 200)
          throw Error();
        q = q.startAfter(value, id);
      } catch {
        throw new HttpsError(
          "invalid-argument",
          "Cursor does not match this search. Reset the filters.",
        );
      }
    }
    const page = await q.limit(size + 1).get(),
      docs = page.docs.slice(0, size),
      last = docs.at(-1),
      more = page.size > size;
    const nextCursor =
      more && last
        ? Buffer.from(
            JSON.stringify({
              id: last.id,
              value:
                field === "createdAt"
                  ? last.get(field).toMillis()
                  : last.get(field),
              scope: scopeHash,
            }),
          ).toString("base64url")
        : null;
    return { items: docs.map((d) => serialize(d.id, d.data())), nextCursor };
  }
}
