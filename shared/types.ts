export type ListingMode = "sale" | "swap" | "donation";
export type ListingStatus =
  | "active"
  | "reserved"
  | "completed"
  | "withdrawn"
  | "removed";
export interface User {
  id: string;
  displayName: string;
  email: string;
  campusId: string;
  role: "student" | "admin";
  verificationStatus: "verified" | "pending" | "rejected";
  accountStatus: "active" | "suspended";
  department: string;
  year: string;
}
export interface Listing {
  id: string;
  ownerId: string;
  campusId: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  mode: ListingMode;
  pricePaise: number | null;
  swapWanted?: string;
  imagePaths: string[];
  status: ListingStatus;
  createdAt: string;
  updatedAt: string;
  pendingDealId?: string | null;
  confirmedDealId?: string;
}
export type CreateListingInput = Pick<
  Listing,
  | "title"
  | "description"
  | "category"
  | "condition"
  | "mode"
  | "pricePaise"
  | "swapWanted"
  | "imagePaths"
> & { idempotencyKey: string };
export interface Ride {
  id: string;
  driverId: string;
  campusId: string;
  pickupPointId: string;
  destinationPointId: string;
  departureAt: string;
  seatsTotal: number;
  seatsAvailable: number;
  costSharePaise: number;
  vehicleType: "car" | "twoWheeler" | "other";
  notes: string;
  status: "open" | "cancelled" | "completed";
  createdAt: string;
  updatedAt: string;
}
export type CreateRideInput = Pick<
  Ride,
  | "pickupPointId"
  | "destinationPointId"
  | "departureAt"
  | "seatsTotal"
  | "costSharePaise"
  | "vehicleType"
  | "notes"
> & { idempotencyKey: string };
export interface RideRequest {
  id: string;
  rideId: string;
  passengerId: string;
  driverId: string;
  campusId: string;
  seatsRequested: 1;
  status: "pending" | "accepted" | "rejected" | "cancelled";
  createdAt: string;
}
export interface Conversation {
  id: string;
  participantIds: string[];
  contextType: "listing" | "ride";
  contextId: string;
  title: string;
  updatedAt: string;
}
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
}
export interface Report {
  id: string;
  reporterId: string;
  targetType: "listing" | "ride" | "user";
  targetId: string;
  reason: string;
  status: "open" | "resolved";
  resolution?: string;
  createdAt: string;
}
export interface Notice {
  id: string;
  uid: string;
  title: string;
  href: string;
  read: boolean;
  createdAt: string;
}
export interface Deal {
  id: string;
  listingId: string;
  sellerId: string;
  buyerId: string;
  campusId: string;
  mode: ListingMode;
  status: "proposed" | "confirmed" | "cancelled";
  sellerConfirmed: boolean;
  buyerConfirmed: boolean;
  createdAt: string;
}
export interface DemoState {
  deals?: Deal[];
  version: 1;
  currentUserId: string;
  users: User[];
  listings: Listing[];
  rides: Ride[];
  requests: RideRequest[];
  conversations: Conversation[];
  messages: Message[];
  reports: Report[];
  notices: Notice[];
  saved: Record<string, string[]>;
  blocks: Record<string, string[]>;
  images: Record<string, string>;
  audit: { actorId: string; action: string; at: string }[];
  operations: Record<string, { hash: string; result: unknown }>;
}
