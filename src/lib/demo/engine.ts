import type {
  DemoState,
  User,
  CreateListingInput,
  CreateRideInput,
  ListingStatus,
  Report,
} from "../../../shared/types";
import {
  listingSchema,
  rideSchema,
  messageSchema,
} from "../../../shared/validation";
import { cancelRequest, decideRequest } from "../../../shared/ride-transitions";

// LOCAL DEMONSTRATION ONLY. All data is readable/editable in this browser.
// These checks illustrate business rules; Firebase server authorization is still required.
export function createDemoEngine(
  initial: DemoState,
  persist: (state: DemoState) => void = () => {},
) {
  let state = initial;
  const listeners = new Set<() => void>();
  const now = () => new Date().toISOString();
  const id = () => crypto.randomUUID();
  function update<T>(fn: (draft: DemoState) => T): T {
    const draft = structuredClone(state);
    const result = fn(draft);
    persist(draft); // If browser storage is full, leave state intact and show the error.
    state = draft;
    listeners.forEach((fn) => fn());
    return result;
  }
  function user(s: DemoState, verified = true): User {
    const u = s.users.find((u) => u.id === s.currentUserId);
    if (!u) throw new Error("Choose a demo account first.");
    if (u.accountStatus !== "active")
      throw new Error("This demo account is suspended.");
    if (verified && u.verificationStatus !== "verified")
      throw new Error("Campus approval is required.");
    return u;
  }
  function admin(s: DemoState) {
    const u = user(s);
    if (u.role !== "admin") throw new Error("Admin access required.");
    return u;
  }
  function blocked(s: DemoState, a: string, b: string) {
    return s.blocks[a]?.includes(b) || s.blocks[b]?.includes(a);
  }
  function notify(s: DemoState, uid: string, title: string, href: string) {
    s.notices.unshift({
      id: id(),
      uid,
      title,
      href,
      read: false,
      createdAt: now(),
    });
  }
  function once<T>(
    s: DemoState,
    key: string,
    payload: unknown,
    fn: () => T,
  ): T {
    const receiptKey = s.currentUserId + ":" + key;
    const hash = JSON.stringify(payload);
    const old = s.operations[receiptKey];
    if (old) {
      if (old.hash !== hash)
        throw new Error("Retry key was reused for a different action.");
      return old.result as T;
    }
    const result = fn();
    s.operations[receiptKey] = { hash, result };
    return result;
  }
  function listing(s: DemoState, listingId: string) {
    const u = user(s);
    const item = s.listings.find(
      (l) => l.id === listingId && l.campusId === u.campusId,
    );
    if (!item) throw new Error("Listing unavailable.");
    return item;
  }
  function ride(s: DemoState, rideId: string) {
    const u = user(s);
    const item = s.rides.find(
      (r) => r.id === rideId && r.campusId === u.campusId,
    );
    if (!item) throw new Error("Ride unavailable.");
    return item;
  }
  const api = {
    switchUser(uid: string) {
      update((s) => {
        if (uid && !s.users.some((u) => u.id === uid))
          throw new Error("Unknown account.");
        s.currentUserId = uid;
      });
    },
    updateProfile(input: {
      displayName: string;
      department: string;
      year: string;
    }) {
      return update((s) => {
        const u = user(s, false);
        const name = input.displayName.trim();
        if (name.length < 2 || name.length > 60)
          throw new Error("Name must have 2–60 characters.");
        Object.assign(u, input, { displayName: name });
        return { profile: u };
      });
    },
    reviewVerification(
      uid: string,
      decision: "approve" | "reject",
      reason: string,
    ) {
      update((s) => {
        const a = admin(s);
        if (!reason.trim()) throw new Error("Add a review reason.");
        const target = s.users.find((u) => u.id === uid);
        if (!target) throw new Error("Account not found.");
        target.verificationStatus =
          decision === "approve" ? "verified" : "rejected";
        s.audit.push({
          actorId: a.id,
          action: `${decision} verification ${uid}: ${reason}`,
          at: now(),
        });
      });
    },
    createListing(input: CreateListingInput) {
      return update((s) => {
        const u = user(s);
        const data = listingSchema.parse(input);
        return once(s, input.idempotencyKey, input, () => {
          if (
            data.imagePaths.some((p) => !p.startsWith("demo:") && !s.images[p])
          )
            throw new Error("Upload the image first.");
          const listingId = id();
          const { idempotencyKey: _key, ...fields } = data;
          s.listings.unshift({
            ...fields,
            id: listingId,
            ownerId: u.id,
            campusId: u.campusId,
            status: "active",
            createdAt: now(),
            updatedAt: now(),
          });
          return { listingId };
        });
      });
    },
    updateListing(
      listingId: string,
      input: CreateListingInput,
      expectedUpdatedAt: string,
    ) {
      update((s) => {
        const u = user(s);
        const item = listing(s, listingId);
        if (item.ownerId !== u.id)
          throw new Error("Only the owner can edit this item.");
        if (!["active", "reserved"].includes(item.status))
          throw new Error("This listing cannot be edited.");
        if (item.updatedAt !== expectedUpdatedAt)
          throw new Error("This item changed. Reload before editing.");
        const { idempotencyKey: _key, ...data } = listingSchema.parse(input);
        Object.assign(item, data, { updatedAt: now() });
      });
    },
    setListingStatus(listingId: string, status: ListingStatus) {
      update((s) => {
        const u = user(s);
        const item = listing(s, listingId);
        if (item.ownerId !== u.id)
          throw new Error("Only the owner can update this listing.");
        const allowed: Record<ListingStatus, ListingStatus[]> = {
          active: ["reserved", "completed", "withdrawn"],
          reserved: ["active", "completed", "withdrawn"],
          completed: [],
          withdrawn: [],
          removed: [],
        };
        if (!allowed[item.status].includes(status))
          throw new Error("This status change is not allowed.");
        item.status = status;
        item.updatedAt = now();
      });
    },
    saveListing(listingId: string) {
      update((s) => {
        const u = user(s);
        listing(s, listingId);
        const saved = s.saved[u.id] ?? [];
        s.saved[u.id] = saved.includes(listingId)
          ? saved.filter((v) => v !== listingId)
          : [...saved, listingId];
      });
    },
    saveImage(dataUrl: string) {
      return update((s) => {
        const u = user(s);
        if (
          !dataUrl.startsWith("data:image/jpeg;base64,") ||
          dataUrl.length > 500000
        )
          throw new Error("Choose a smaller image.");
        const path = `demo-upload/${u.id}/${id()}`;
        s.images[path] = dataUrl;
        return path;
      });
    },
    createRide(input: CreateRideInput) {
      return update((s) => {
        const u = user(s);
        const data = rideSchema.parse(input);
        return once(s, input.idempotencyKey, input, () => {
          const rideId = id();
          const { idempotencyKey: _key, ...fields } = data;
          s.rides.unshift({
            ...fields,
            id: rideId,
            driverId: u.id,
            campusId: u.campusId,
            seatsAvailable: data.seatsTotal,
            status: "open",
            createdAt: now(),
            updatedAt: now(),
          });
          return { rideId };
        });
      });
    },
    requestRide(rideId: string, key: string) {
      return update((s) => {
        const u = user(s);
        const r = ride(s, rideId);
        return once(s, key, { rideId }, () => {
          if (r.driverId === u.id)
            throw new Error("You cannot request your own ride.");
          const driver = s.users.find((p) => p.id === r.driverId);
          if (
            !driver ||
            driver.accountStatus !== "active" ||
            blocked(s, u.id, r.driverId)
          )
            throw new Error("This ride is not available to request.");
          if (
            r.status !== "open" ||
            Date.parse(r.departureAt) <= Date.now() ||
            r.seatsAvailable < 1
          )
            throw new Error("This ride is no longer available.");
          const requestId = `${rideId}_${u.id}`;
          if (s.requests.some((q) => q.id === requestId))
            throw new Error("You already requested this ride.");
          s.requests.push({
            id: requestId,
            rideId,
            passengerId: u.id,
            driverId: r.driverId,
            campusId: u.campusId,
            seatsRequested: 1,
            status: "pending",
            createdAt: now(),
          });
          notify(
            s,
            r.driverId,
            `${u.displayName} requested a seat`,
            "/my-rides",
          );
          return { requestId, status: "pending" as const };
        });
      });
    },
    respondToRideRequest(
      requestId: string,
      decision: "accept" | "reject",
      key: string,
    ) {
      return update((s) => {
        const u = user(s);
        return once(s, key, { requestId, decision }, () => {
          const q = s.requests.find((q) => q.id === requestId);
          if (!q) throw new Error("Request not found.");
          const r = ride(s, q.rideId);
          const p = s.users.find((p) => p.id === q.passengerId);
          if (
            !p ||
            p.accountStatus !== "active" ||
            p.verificationStatus !== "verified" ||
            blocked(s, u.id, p.id)
          )
            throw new Error("Passenger is not eligible.");
          const next = decideRequest(r, q, u.id, decision);
          Object.assign(r, next.ride);
          Object.assign(q, next.request);
          notify(
            s,
            q.passengerId,
            `Your ride request was ${q.status}`,
            "/my-rides",
          );
          return { status: q.status, seatsAvailable: r.seatsAvailable };
        });
      });
    },
    cancelRideRequest(requestId: string, key: string) {
      return update((s) => {
        const u = user(s);
        return once(s, key, { requestId, action: "cancel" }, () => {
          const q = s.requests.find((q) => q.id === requestId);
          if (!q) throw new Error("Request not found.");
          const r = ride(s, q.rideId);
          const next = cancelRequest(r, q, u.id);
          Object.assign(r, next.ride);
          Object.assign(q, next.request);
          notify(
            s,
            r.driverId,
            "A passenger cancelled their request",
            "/my-rides",
          );
          return { status: q.status, seatsAvailable: r.seatsAvailable };
        });
      });
    },
    cancelRide(rideId: string) {
      update((s) => {
        const u = user(s);
        const r = ride(s, rideId);
        if (r.driverId !== u.id) throw new Error("Only the driver can cancel.");
        if (r.status !== "open" || Date.parse(r.departureAt) <= Date.now())
          throw new Error("This ride cannot be cancelled.");
        r.status = "cancelled";
        for (const q of s.requests.filter(
          (q) =>
            q.rideId === rideId && ["pending", "accepted"].includes(q.status),
        )) {
          q.status = "cancelled";
          notify(
            s,
            q.passengerId,
            "Your ride was cancelled by the driver",
            "/my-rides",
          );
        }
      });
    },
    completeRide(rideId: string) {
      update((s) => {
        const u = user(s);
        const r = ride(s, rideId);
        if (
          r.driverId !== u.id ||
          r.status !== "open" ||
          Date.parse(r.departureAt) > Date.now()
        )
          throw new Error(
            "Only the driver can complete an open ride after departure.",
          );
        r.status = "completed";
      });
    },
    openConversation(
      contextType: "listing" | "ride",
      contextId: string,
      otherUserId: string,
    ) {
      return update((s) => {
        const u = user(s);
        if (otherUserId === u.id || blocked(s, u.id, otherUserId))
          throw new Error("This conversation is unavailable.");
        const other = s.users.find((p) => p.id === otherUserId);
        if (
          !other ||
          other.campusId !== u.campusId ||
          other.accountStatus !== "active" ||
          other.verificationStatus !== "verified"
        )
          throw new Error("Member unavailable.");
        let title: string;
        if (contextType === "listing") {
          const l = listing(s, contextId);
          if (l.ownerId !== otherUserId || l.status !== "active")
            throw new Error("This listing is no longer available.");
          title = l.title;
        } else {
          const r = ride(s, contextId);
          const q = s.requests.find(
            (q) =>
              q.rideId === r.id && [u.id, otherUserId].includes(q.passengerId),
          );
          if (!q || ![u.id, otherUserId].includes(r.driverId))
            throw new Error("Request a seat before messaging the driver.");
          title = "Ride coordination";
        }
        const participants = [u.id, otherUserId].sort();
        const conversationId = `${contextType}_${contextId}_${participants.join("_")}`;
        if (!s.conversations.some((c) => c.id === conversationId))
          s.conversations.push({
            id: conversationId,
            participantIds: participants,
            contextId,
            contextType,
            title,
            updatedAt: now(),
          });
        return { conversationId };
      });
    },
    sendMessage(conversationId: string, text: string, key: string) {
      return update((s) => {
        const u = user(s);
        return once(s, key, { conversationId, text }, () => {
          const c = s.conversations.find(
            (c) => c.id === conversationId && c.participantIds.includes(u.id),
          );
          if (!c) throw new Error("Conversation unavailable.");
          const other = c.participantIds.find((v) => v !== u.id)!;
          if (
            blocked(s, u.id, other) ||
            s.users.find((p) => p.id === other)?.accountStatus !== "active"
          )
            throw new Error("Messaging is unavailable for this member.");
          const messageId = id();
          s.messages.push({
            id: messageId,
            conversationId,
            senderId: u.id,
            text: messageSchema.parse(text),
            createdAt: now(),
          });
          c.updatedAt = now();
          notify(
            s,
            other,
            `New message from ${u.displayName}`,
            `/messages/${conversationId}`,
          );
          return { messageId, createdAt: now() };
        });
      });
    },
    submitReport(
      targetType: Report["targetType"],
      targetId: string,
      reason: string,
    ) {
      update((s) => {
        const u = user(s);
        if (reason.trim().length < 5 || reason.length > 2000)
          throw new Error("Describe the concern in 5–2000 characters.");
        if (targetType === "listing") listing(s, targetId);
        else if (targetType === "ride") ride(s, targetId);
        else if (
          !s.users.some((p) => p.id === targetId && p.campusId === u.campusId)
        )
          throw new Error("Member unavailable.");
        s.reports.unshift({
          id: id(),
          reporterId: u.id,
          targetType,
          targetId,
          reason: reason.trim(),
          status: "open",
          createdAt: now(),
        });
      });
    },
    setUserBlock(targetUid: string) {
      update((s) => {
        const u = user(s);
        if (u.id === targetUid) throw new Error("You cannot block yourself.");
        const list = s.blocks[u.id] ?? [];
        s.blocks[u.id] = list.includes(targetUid)
          ? list.filter((v) => v !== targetUid)
          : [...list, targetUid];
      });
    },
    resolveReport(reportId: string, resolution: string, remove: boolean) {
      update((s) => {
        const a = admin(s);
        const report = s.reports.find((r) => r.id === reportId);
        if (!report || resolution.trim().length < 5)
          throw new Error("Add a moderation reason.");
        if (report.status === "resolved")
          throw new Error("This report is already resolved.");
        if (remove && report.targetType !== "listing")
          throw new Error(
            "This starter supports removal for listing reports only.",
          );
        report.status = "resolved";
        report.resolution = resolution;
        if (remove) {
          const item = s.listings.find((l) => l.id === report.targetId);
          if (item) item.status = "removed";
        }
        s.audit.push({
          actorId: a.id,
          action: `${remove ? "remove listing and resolve" : "resolve"} ${reportId}: ${resolution}`,
          at: now(),
        });
      });
    },
    markNotificationRead(noticeId: string) {
      update((s) => {
        const u = user(s);
        const n = s.notices.find((n) => n.id === noticeId && n.uid === u.id);
        if (n) n.read = true;
      });
    },
  };
  return {
    api,
    getSnapshot: () => state,
    subscribe: (fn: () => void) => {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    },
  };
}
