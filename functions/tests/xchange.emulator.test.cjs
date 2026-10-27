const { test } = require("node:test");
const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
if (
  !process.env.FIRESTORE_EMULATOR_HOST ||
  !process.env.GCLOUD_PROJECT?.startsWith("demo-")
)
  throw Error("Run only through emulators:exec with a demo- project.");
initializeApp({ projectId: process.env.GCLOUD_PROJECT });
const { XChangeService } = require("../lib/xchange/service");
const { createListing } = require("../lib/xchange");
const db = getFirestore();
const fail = (code) => (e) => e.code === code;
async function fixture() {
  const a = randomUUID(),
    b = randomUUID(),
    c = randomUUID(),
    campusId = randomUUID();
  await Promise.all(
    [a, b, c].map((uid) =>
      db.doc(`users/${uid}`).set({
        campusId,
        accountStatus: "active",
        verificationStatus: "verified",
      }),
    ),
  );
  await Promise.all(
    [a, b, c].map((uid) =>
      db
        .doc(`publicProfiles/${uid}`)
        .set({
          campusId,
          displayName: `Member ${uid.slice(0, 4)}`,
          verificationStatus: "verified",
          email: "private@example.test",
        }),
    ),
  );
  const service = new XChangeService(db, async (paths) => {
    if (paths.some((p) => p.endsWith("missing.jpg")))
      throw new (require("firebase-functions/v2/https").HttpsError)(
        "failed-precondition",
        "Missing image",
      );
  });
  const input = (extra = {}) => ({
    title: "Engineering Mathematics",
    description: "A textbook in good condition for first year.",
    category: "books",
    condition: "good",
    mode: "sale",
    pricePaise: 30000,
    imagePaths: [`listing-images/${a}/upload/book.jpg`],
    idempotencyKey: randomUUID(),
    ...extra,
  });
  const create = async (extra = {}) => service.create(a, input(extra));
  const get = async (id) => (await db.doc(`listings/${id}`).get()).data();
  const conversation = async (buyer) =>
    db.collection("conversations").add({
      campusId,
      contextType: "listing",
      contextId: (await createBook()).listingId,
      participantIds: [a, buyer],
    });
  let book;
  async function createBook() {
    return (book ??= await create());
  }
  return {
    a,
    b,
    c,
    campusId,
    service,
    input,
    create,
    get,
    conversation,
    createBook,
  };
}
test("callable rejects missing auth and unverified email before reading records", async () => {
  await assert.rejects(
    () => createListing.run({ data: {} }),
    fail("unauthenticated"),
  );
  await assert.rejects(
    () =>
      createListing.run({
        auth: { uid: "a", token: { email_verified: false } },
        data: {},
      }),
    fail("permission-denied"),
  );
});
test("concurrent duplicate creation has one receipt and one listing", async () => {
  const f = await fixture(),
    input = f.input();
  const result = await Promise.all([
    f.service.create(f.a, input),
    f.service.create(f.a, input),
  ]);
  assert.deepEqual(result[0], result[1]);
  assert.equal(
    (await db.collection("listings").where("campusId", "==", f.campusId).get())
      .size,
    1,
  );
  await assert.rejects(
    () => f.service.create(f.a, { ...input, pricePaise: 40000 }),
    fail("already-exists"),
  );
  const l = await f.get(result[0].listingId);
  assert.equal(l.ownerId, f.a);
  assert.equal(l.titleNormalized, "engineering mathematics");
});
test("invalid modes, foreign image paths, owner spoofing and missing objects write nothing", async () => {
  const f = await fixture();
  for (const input of [
    f.input({ mode: ["sale"], pricePaise: 0 }),
    f.input({ category: ["books"] }),
    f.input({ swapWanted: false }),
    f.input({ mode: "donation", pricePaise: 1 }),
    f.input({ mode: "swap", pricePaise: null, swapWanted: "" }),
    f.input({ pricePaise: 1.2 }),
    f.input({ imagePaths: [`listing-images/${f.b}/up/image.jpg`] }),
    f.input({ ownerId: f.b }),
  ])
    await assert.rejects(
      () => f.service.create(f.a, input),
      fail("invalid-argument"),
    );
  await assert.rejects(
    () => f.create({ imagePaths: [`listing-images/${f.a}/up/missing.jpg`] }),
    fail("failed-precondition"),
  );
  assert.equal(
    (await db.collection("listings").where("campusId", "==", f.campusId).get())
      .size,
    0,
  );
});
test("same-campus outsiders cannot edit; pending, suspended and other-campus members cannot write/read", async () => {
  const f = await fixture(),
    { listingId } = await f.create(),
    old = await f.get(listingId),
    expectedUpdatedAt = old.updatedAt.toDate().toISOString();
  await assert.rejects(
    () =>
      f.service.update(f.b, {
        listingId,
        patch: { title: "Stolen item" },
        expectedUpdatedAt,
      }),
    fail("permission-denied"),
  );
  await assert.rejects(
    () =>
      f.service.setStatus(f.b, {
        listingId,
        status: "withdrawn",
        expectedUpdatedAt,
      }),
    fail("permission-denied"),
  );
  await db.doc(`users/${f.c}`).update({ campusId: "different" });
  await assert.rejects(
    () => f.service.get(f.c, { listingId }),
    fail("not-found"),
  );
  await db.doc(`users/${f.a}`).update({ verificationStatus: "pending" });
  await assert.rejects(() => f.create(), fail("permission-denied"));
  await db
    .doc(`users/${f.a}`)
    .update({ verificationStatus: "verified", accountStatus: "suspended" });
  await assert.rejects(
    () => f.service.list(f.a, {}),
    fail("permission-denied"),
  );
});
test("two simultaneous edits from one version cannot silently overwrite each other", async () => {
  const f = await fixture(),
    { listingId } = await f.create(),
    old = await f.get(listingId),
    expectedUpdatedAt = old.updatedAt.toDate().toISOString();
  const r = await Promise.allSettled(
    ["First update", "Second update"].map((title) =>
      f.service.update(f.a, { listingId, patch: { title }, expectedUpdatedAt }),
    ),
  );
  assert.equal(r.filter((x) => x.status === "fulfilled").length, 1);
  assert.equal(r.find((x) => x.status === "rejected").reason.code, "aborted");
  await assert.rejects(
    () =>
      f.service.update(f.a, {
        listingId,
        patch: { ownerId: f.b },
        expectedUpdatedAt,
      }),
    fail("invalid-argument"),
  );
});
test("reserve/unreserve and terminal statuses enforce versions and prohibit reopening", async () => {
  const f = await fixture(),
    { listingId } = await f.create();
  for (const status of ["reserved", "active", "completed"]) {
    const item = await f.get(listingId);
    await f.service.setStatus(f.a, {
      listingId,
      status,
      expectedUpdatedAt: item.updatedAt.toDate().toISOString(),
    });
  }
  const completed = await f.get(listingId);
  await assert.rejects(
    () =>
      f.service.setStatus(f.a, {
        listingId,
        status: "active",
        expectedUpdatedAt: completed.updatedAt.toDate().toISOString(),
      }),
    fail("failed-precondition"),
  );
  assert.equal((await f.service.list(f.a, {})).items.length, 0);
});
test("partial swap edits preserve null price; no account email leaks from seller card", async () => {
  const f = await fixture(),
    { listingId } = await f.create({
      mode: "swap",
      pricePaise: null,
      swapWanted: "Calculator",
    });
  const old = await f.get(listingId);
  await f.service.update(f.a, {
    listingId,
    patch: { description: "Updated description for this textbook." },
    expectedUpdatedAt: old.updatedAt.toDate().toISOString(),
  });
  await db.doc(`publicProfiles/${f.a}`).set({
    campusId: f.campusId,
    displayName: "Seller",
    email: "private@example.test",
    department: "CSE",
    verificationStatus: "verified",
  });
  const result = await f.service.get(f.b, { listingId });
  assert.equal(result.listing.pricePaise, null);
  assert.equal(result.seller.email, undefined);
  await db.doc(`listings/${listingId}`).update({ privateNotes: "secret" });
  assert.equal(
    (await f.service.get(f.b, { listingId })).listing.privateNotes,
    undefined,
  );
});
test("cursor pages have no duplicates, stay in campus and bind filters and account", async () => {
  const f = await fixture();
  for (let i = 0; i < 5; i++)
    await f.create({ title: `Engineering book ${i}`, pricePaise: 100 + i });
  const other = await fixture();
  await other.create();
  const first = await f.service.list(f.a, {
    prefix: "engineering",
    pageSize: 2,
  });
  const second = await f.service.list(f.a, {
    prefix: "engineering",
    pageSize: 2,
    cursor: first.nextCursor,
  });
  assert.equal(
    new Set([...first.items, ...second.items].map((l) => l.id)).size,
    4,
  );
  assert.ok(first.items.every((l) => l.campusId === f.campusId));
  await assert.rejects(
    () =>
      f.service.list(f.b, {
        prefix: "engineering",
        pageSize: 2,
        cursor: first.nextCursor,
      }),
    fail("invalid-argument"),
  );
  await assert.rejects(
    () =>
      f.service.list(f.a, {
        category: "books",
        pageSize: 2,
        cursor: first.nextCursor,
      }),
    fail("invalid-argument"),
  );
  const price = await f.service.list(f.a, { mode: "sale", sort: "price-asc" });
  assert.deepEqual(
    price.items.map((l) => l.pricePaise),
    [100, 101, 102, 103, 104],
  );
  await assert.rejects(
    () =>
      f.service.list(f.a, {
        prefix: "engineering",
        mode: "sale",
        sort: "price-asc",
      }),
    fail("invalid-argument"),
  );
});
test("deal requires a conversation, one pending deal per item, two confirmations and participant privacy", async () => {
  const f = await fixture(),
    { listingId } = await f.createBook(),
    request = { listingId, buyerId: f.b, idempotencyKey: randomUUID() };
  await assert.rejects(
    () => f.service.proposeDeal(f.a, request),
    fail("failed-precondition"),
  );
  await f.conversation(f.b);
  const deal = await f.service.proposeDeal(f.a, request);
  assert.equal((await f.service.get(f.a, { listingId })).contacts[0].id, f.b);
  assert.equal((await f.service.get(f.b, { listingId })).contacts.length, 0);
  assert.deepEqual(await f.service.proposeDeal(f.a, request), deal);
  await f.conversation(f.c);
  await assert.rejects(
    () =>
      f.service.proposeDeal(f.a, {
        listingId,
        buyerId: f.c,
        idempotencyKey: randomUUID(),
      }),
    fail("failed-precondition"),
  );
  const old = await f.get(listingId);
  await assert.rejects(
    () =>
      f.service.update(f.a, {
        listingId,
        patch: { title: "Changed during handover" },
        expectedUpdatedAt: old.updatedAt.toDate().toISOString(),
      }),
    fail("failed-precondition"),
  );
  await assert.rejects(
    () => f.service.confirmDeal(f.c, { dealId: deal.dealId, confirm: true }),
    fail("permission-denied"),
  );
  assert.equal((await f.service.get(f.c, { listingId })).deal, null);
  assert.equal(
    (await f.service.confirmDeal(f.a, { dealId: deal.dealId, confirm: true }))
      .status,
    "proposed",
  );
  assert.equal(
    (await f.service.confirmDeal(f.b, { dealId: deal.dealId, confirm: true }))
      .status,
    "confirmed",
  );
  assert.equal(
    (await f.service.confirmDeal(f.b, { dealId: deal.dealId, confirm: true }))
      .status,
    "confirmed",
  );
  assert.equal((await f.get(listingId)).status, "completed");
  assert.equal(
    (await f.service.get(f.b, { listingId })).deal.status,
    "confirmed",
  );
  await assert.rejects(
    () => f.service.get(f.c, { listingId }),
    fail("not-found"),
  );
});
test("blocked counterpart cannot confirm; participant cancellation restores listing once", async () => {
  const f = await fixture(),
    { listingId } = await f.createBook();
  await f.conversation(f.b);
  const d = await f.service.proposeDeal(f.a, {
    listingId,
    buyerId: f.b,
    idempotencyKey: randomUUID(),
  });
  await db
    .doc(`users/${f.b}/blocks/${f.a}`)
    .set({ createdAt: Timestamp.now() });
  await assert.rejects(
    () => f.service.confirmDeal(f.a, { dealId: d.dealId, confirm: true }),
    fail("permission-denied"),
  );
  assert.equal(
    (await f.service.confirmDeal(f.b, { dealId: d.dealId, confirm: false }))
      .status,
    "cancelled",
  );
  assert.equal((await f.get(listingId)).status, "active");
  assert.equal(
    (await f.service.confirmDeal(f.b, { dealId: d.dealId, confirm: false }))
      .status,
    "cancelled",
  );
});
test("eligible seller can cancel when the counterpart becomes suspended", async () => {
  const f = await fixture(),
    { listingId } = await f.createBook();
  await f.conversation(f.b);
  const d = await f.service.proposeDeal(f.a, {
    listingId,
    buyerId: f.b,
    idempotencyKey: randomUUID(),
  });
  await db.doc(`users/${f.b}`).update({ accountStatus: "suspended" });
  await assert.rejects(
    () => f.service.confirmDeal(f.a, { dealId: d.dealId, confirm: true }),
    fail("permission-denied"),
  );
  assert.equal(
    (await f.service.confirmDeal(f.a, { dealId: d.dealId, confirm: false }))
      .status,
    "cancelled",
  );
});
test("create rate limit rejects the eleventh new listing but matching retries work", async () => {
  const f = await fixture(),
    first = f.input();
  await f.service.create(f.a, first);
  for (let i = 0; i < 9; i++) await f.create();
  await assert.rejects(() => f.create(), fail("resource-exhausted"));
  assert.ok((await f.service.create(f.a, first)).listingId);
});
