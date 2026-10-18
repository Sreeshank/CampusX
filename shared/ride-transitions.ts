import type { Ride, RideRequest } from "./types";

// Pure business logic shared with tests. A live backend MUST wrap these checks in a transaction.
export function decideRequest(
  ride: Ride,
  request: RideRequest,
  actorId: string,
  decision: "accept" | "reject",
  now = Date.now(),
) {
  if (ride.driverId !== actorId)
    throw new Error("Only this ride’s driver can decide requests.");
  if (ride.status !== "open" || Date.parse(ride.departureAt) <= now)
    throw new Error("This ride is no longer open.");
  if (request.rideId !== ride.id)
    throw new Error("Request does not belong to this ride.");
  if (request.status === (decision === "accept" ? "accepted" : "rejected"))
    return { ride, request };
  if (request.status !== "pending")
    throw new Error("This request has already been decided.");
  if (decision === "accept" && ride.seatsAvailable < 1)
    throw new Error("The last seat has already been taken.");
  return {
    ride: {
      ...ride,
      seatsAvailable: ride.seatsAvailable - (decision === "accept" ? 1 : 0),
    },
    request: {
      ...request,
      status:
        decision === "accept" ? ("accepted" as const) : ("rejected" as const),
    },
  };
}
export function cancelRequest(
  ride: Ride,
  request: RideRequest,
  actorId: string,
  now = Date.now(),
) {
  if (request.passengerId !== actorId)
    throw new Error("You can only cancel your own request.");
  if (request.rideId !== ride.id)
    throw new Error("Request does not belong to this ride.");
  if (request.status === "cancelled") return { ride, request };
  if (ride.status !== "open" || Date.parse(ride.departureAt) <= now)
    throw new Error("This ride is no longer open.");
  if (!["pending", "accepted"].includes(request.status))
    throw new Error("This request cannot be cancelled.");
  return {
    ride: {
      ...ride,
      seatsAvailable:
        ride.seatsAvailable + (request.status === "accepted" ? 1 : 0),
    },
    request: { ...request, status: "cancelled" as const },
  };
}
