import { describe, it, expect } from "vitest";
import { createDemoEngine } from "../src/lib/demo/engine";
import { createSeed } from "../src/lib/demo/seed";
import { listingSchema, rideSchema } from "../shared/validation";
const item = {
  title: "Sample textbook",
  description: "A useful textbook in good condition.",
  category: "books",
  condition: "good",
  mode: "sale" as const,
  pricePaise: 30000,
  imagePaths: ["demo:books"],
  idempotencyKey: "item-1",
};
describe("starter business examples", () => {
  it("rejects invalid listing modes/prices", () => {
    expect(
      listingSchema.safeParse({ ...item, mode: "donation", pricePaise: 20 })
        .success,
    ).toBe(false);
    expect(
      listingSchema.safeParse({ ...item, mode: "swap", pricePaise: null })
        .success,
    ).toBe(false);
  });
  it("deduplicates a listing creation and rejects key misuse", () => {
    const e = createDemoEngine(createSeed());
    const a = e.api.createListing(item);
    const b = e.api.createListing(item);
    expect(a).toEqual(b);
    expect(
      e.getSnapshot().listings.filter((l) => l.id === a.listingId),
    ).toHaveLength(1);
    expect(() =>
      e.api.createListing({ ...item, title: "Different textbook" }),
    ).toThrow("Retry key");
  });
  it("rejects editing or withdrawing another user listing", () => {
    const e = createDemoEngine(createSeed());
    expect(() => e.api.setListingStatus("book", "withdrawn")).toThrow("owner");
  });
  it("pending student cannot publish or self-approve", () => {
    const e = createDemoEngine(createSeed());
    e.api.switchUser("pending");
    expect(() => e.api.createListing(item)).toThrow("approval");
    expect(() =>
      e.api.reviewVerification("pending", "approve", "Test roster"),
    ).toThrow();
  });
  it("supports request, acceptance and cancellation across demo accounts", () => {
    const e = createDemoEngine(createSeed());
    const q = e.api.requestRide("ride-b", "q");
    e.api.switchUser("b");
    e.api.respondToRideRequest(q.requestId, "accept", "accept");
    expect(
      e.getSnapshot().rides.find((r) => r.id === "ride-b")?.seatsAvailable,
    ).toBe(1);
    e.api.switchUser("a");
    e.api.cancelRideRequest(q.requestId, "cancel");
    e.api.cancelRideRequest(q.requestId, "cancel");
    expect(
      e.getSnapshot().rides.find((r) => r.id === "ride-b")?.seatsAvailable,
    ).toBe(2);
  });
  it("denies outsider messaging and blocked sending", () => {
    const e = createDemoEngine(createSeed());
    const c = e.api.openConversation("listing", "book", "b");
    e.api.switchUser("admin");
    expect(() => e.api.sendMessage(c.conversationId, "Hello", "m")).toThrow(
      "unavailable",
    );
    e.api.switchUser("b");
    e.api.setUserBlock("a");
    e.api.switchUser("a");
    expect(() => e.api.sendMessage(c.conversationId, "Hello", "m2")).toThrow(
      "unavailable",
    );
  });
  it("only admin can resolve reports; removal is terminal for owner", () => {
    const e = createDemoEngine(createSeed());
    e.api.submitReport("listing", "book", "Example report for testing");
    const r = e.getSnapshot().reports[0];
    expect(() => e.api.resolveReport(r.id, "Reviewed sample", true)).toThrow(
      "Admin",
    );
    e.api.switchUser("admin");
    e.api.resolveReport(r.id, "Reviewed sample", true);
    e.api.switchUser("b");
    expect(() => e.api.setListingStatus("book", "active")).toThrow(
      "not allowed",
    );
  });
  it("does not commit changes after persistence failure", () => {
    const e = createDemoEngine(createSeed(), () => {
      throw new Error("Storage full");
    });
    expect(() => e.api.createListing(item)).toThrow("Storage full");
    expect(e.getSnapshot().listings).toHaveLength(6);
  });
  it("rejects same-point rides and multiple two-wheeler passenger seats", () => {
    const base = {
      pickupPointId: "kits-main-gate",
      destinationPointId: "hanamkonda",
      departureAt: "2099-01-01T10:00:00Z",
      seatsTotal: 2,
      costSharePaise: 4000,
      vehicleType: "twoWheeler",
      notes: "",
      idempotencyKey: "ride",
    };
    expect(rideSchema.safeParse(base).success).toBe(false);
    expect(
      rideSchema.safeParse({
        ...base,
        vehicleType: "car",
        destinationPointId: "kits-main-gate",
      }).success,
    ).toBe(false);
  });
});
