import { httpsCallable } from "firebase/functions";
import { getFirebaseServices } from "../../lib/firebase/client";
import type {
  CreateListingInput,
  Deal,
  Listing,
  ListingStatus,
} from "../../../shared/types";

export interface ListingFilters {
  scope?: "feed" | "mine";
  category?: string;
  mode?: "sale" | "swap" | "donation";
  prefix?: string;
  sort?: "newest" | "price-asc" | "price-desc";
  status?: ListingStatus;
  cursor?: string | null;
  pageSize?: number;
}
export interface PublicSeller {
  id: string;
  displayName: string;
  department: string;
  year: string;
  verificationStatus: string;
}
export type ListingFields = Omit<CreateListingInput, "idempotencyKey">;
export interface XChangePlatform {
  // Person 2 supplies these authenticated services. Never substitute demo paths in Firebase mode.
  uploadListingImage(file: File): Promise<string>;
  // A blob URL must be fresh per call; the photo view revokes it on cleanup.
  imageSource(path: string): Promise<string>;
  setSavedListing(input: {
    listingId: string;
    saved: boolean;
  }): Promise<{ saved: boolean }>;
  listSavedListings(
    cursor?: string | null,
  ): Promise<{ items: Listing[]; nextCursor: string | null }>;
  openConversation(input: {
    contextType: "listing";
    contextId: string;
    otherUserId: string;
  }): Promise<{ conversationId: string }>;
  submitReport(input: {
    targetType: "listing";
    targetId: string;
    reason: string;
    details: string;
    idempotencyKey: string;
  }): Promise<{ reportId: string }>;
}
export function createFirebaseXChangeRepository(platform: XChangePlatform) {
  const call = <I, O>(name: string, data: I) =>
    httpsCallable<I, O>(
      getFirebaseServices().functions,
      name,
    )(data).then((r) => r.data);
  return {
    listListings: (input: ListingFilters = {}) =>
      call<ListingFilters, { items: Listing[]; nextCursor: string | null }>(
        "listListings",
        input,
      ),
    listMyListings: (input: Omit<ListingFilters, "scope"> = {}) =>
      call<ListingFilters, { items: Listing[]; nextCursor: string | null }>(
        "listListings",
        { ...input, scope: "mine" },
      ),
    getListing: (listingId: string) =>
      call<
        { listingId: string },
        {
          listing: Listing;
          seller: PublicSeller | null;
          deal: Deal | null;
          contacts: { id: string; displayName: string }[];
        }
      >("getListing", { listingId }),
    createListing: (input: CreateListingInput) =>
      call<CreateListingInput, { listingId: string }>("createListing", input),
    updateListing: (input: {
      listingId: string;
      patch: Partial<ListingFields>;
      expectedUpdatedAt: string;
    }) =>
      call<typeof input, { listingId: string; updatedAt: string }>(
        "updateListing",
        input,
      ),
    setListingStatus: (input: {
      listingId: string;
      status: ListingStatus;
      expectedUpdatedAt: string;
    }) =>
      call<typeof input, { status: ListingStatus }>("setListingStatus", input),
    proposeDeal: (input: {
      listingId: string;
      buyerId: string;
      idempotencyKey: string;
    }) => call<typeof input, { dealId: string }>("proposeDeal", input),
    confirmDeal: (input: { dealId: string; confirm: boolean }) =>
      call<typeof input, { status: Deal["status"] }>("confirmDeal", input),
    async uploadPhotos(files: File[]) {
      if (files.length < 1 || files.length > 5)
        throw new Error("Choose 1–5 photos.");
      if (
        files.some(
          (f) =>
            !["image/jpeg", "image/png", "image/webp"].includes(f.type) ||
            f.size > 5 * 1024 * 1024 ||
            f.size < 1,
        )
      )
        throw new Error("Choose JPG, PNG or WebP images under 5 MB.");
      return Promise.all(
        files.map((file) => platform.uploadListingImage(file)),
      );
    },
    ...platform,
  };
}
