import { describe, it, expect } from "vitest";
import { createDemoEngine } from "../src/lib/demo/engine";
import { createSeed } from "../src/lib/demo/seed";
const item = {
  title: "Test book",
  description: "A useful book in good condition.",
  category: "books",
  condition: "good",
  mode: "sale" as const,
  pricePaise: 30000,
  imagePaths: ["demo:books"],
  idempotencyKey: "new-book",
};
describe("XChange ownership, images and handovers", () => {
  it("denies cross-campus lookup before starting a conversation", () => {
    const s = createSeed();
    s.listings.find((l) => l.id === "book")!.campusId = "elsewhere";
    expect(() =>
      createDemoEngine(s).api.openConversation("listing", "book", "b"),
    ).toThrow("unavailable");
  });
  it("rejects another user's uploaded image on create and edit", () => {
    const s = createSeed();
    s.images["demo-upload/b/photo"] = "data:image/jpeg;base64,AA";
    const e = createDemoEngine(s);
    expect(() =>
      e.api.createListing({ ...item, imagePaths: ["demo-upload/b/photo"] }),
    ).toThrow("Upload");
    const own = e.api.createListing(item);
    const old = e.getSnapshot().listings.find((l) => l.id === own.listingId)!;
    expect(() =>
      e.api.updateListing(
        old.id,
        { ...item, imagePaths: ["demo-upload/b/photo"] },
        old.updatedAt,
      ),
    ).toThrow("own image");
  });
  it("rejects stale edits and status changes", () => {
    const e = createDemoEngine(createSeed());
    const { listingId } = e.api.createListing(item);
    const old = e.getSnapshot().listings.find((l) => l.id === listingId)!;
    e.api.updateListing(
      listingId,
      { ...item, title: "Updated textbook" },
      old.updatedAt,
    );
    expect(() => e.api.updateListing(listingId, item, old.updatedAt)).toThrow(
      "changed",
    );
    expect(() =>
      e.api.setListingStatus(listingId, "reserved", old.updatedAt),
    ).toThrow("changed");
  });
  it("requires a conversation and both confirmations; duplicate proposals and confirms are safe", () => {
    const e = createDemoEngine(createSeed());
    e.api.switchUser("b");
    expect(() => e.api.proposeDeal("book", "a", "deal")).toThrow(
      "conversation",
    );
    e.api.switchUser("a");
    e.api.openConversation("listing", "book", "b");
    e.api.switchUser("b");
    const q = e.api.proposeDeal("book", "a", "deal");
    expect(e.api.proposeDeal("book", "a", "deal")).toEqual(q);
    expect(() => e.api.setListingStatus("book", "completed")).toThrow(
      "handover",
    );
    e.api.confirmDeal(q.dealId, true);
    e.api.confirmDeal(q.dealId, true);
    expect(e.getSnapshot().listings.find((l) => l.id === "book")?.status).toBe(
      "reserved",
    );
    e.api.switchUser("a");
    expect(e.api.confirmDeal(q.dealId, true).status).toBe("confirmed");
    expect(e.api.confirmDeal(q.dealId, true).status).toBe("confirmed");
    expect(e.getSnapshot().listings.find((l) => l.id === "book")?.status).toBe(
      "completed",
    );
    expect(() => e.api.openConversation("listing", "book", "b")).toThrow(
      "no longer available",
    );
  });
  it("blocks outsiders, self-deals and blocked counterparties", () => {
    const e = createDemoEngine(createSeed());
    e.api.openConversation("listing", "book", "b");
    e.api.switchUser("b");
    expect(() => e.api.proposeDeal("book", "b", "self")).toThrow("unavailable");
    const d = e.api.proposeDeal("book", "a", "deal");
    e.api.switchUser("admin");
    expect(() => e.api.confirmDeal(d.dealId, true)).toThrow("unavailable");
    e.api.switchUser("a");
    e.api.setUserBlock("b");
    expect(() => e.api.confirmDeal(d.dealId, true)).toThrow("unavailable");
    expect(e.api.confirmDeal(d.dealId, false).status).toBe("cancelled");
    expect(e.getSnapshot().listings.find((l) => l.id === "book")?.status).toBe(
      "active",
    );
  });
});
