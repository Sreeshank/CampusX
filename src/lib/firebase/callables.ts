// These are typed integration examples, NOT an active app data provider.
import { httpsCallable } from "firebase/functions";
import { getFirebaseServices } from "./client";
import type {
  CreateListingInput,
  CreateRideInput,
} from "../../../shared/types";
export function createListing(input: CreateListingInput) {
  return httpsCallable<CreateListingInput, { listingId: string }>(
    getFirebaseServices().functions,
    "createListing",
  )(input).then((r) => r.data);
}
export function createRide(input: CreateRideInput) {
  return httpsCallable<CreateRideInput, { rideId: string }>(
    getFirebaseServices().functions,
    "createRide",
  )(input).then((r) => r.data);
}
export function requestRide(input: { rideId: string; idempotencyKey: string }) {
  return httpsCallable<typeof input, { requestId: string; status: string }>(
    getFirebaseServices().functions,
    "requestRide",
  )(input).then((r) => r.data);
}
