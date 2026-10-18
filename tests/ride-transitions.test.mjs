import test from "node:test";
import assert from "node:assert/strict";
import { decideRequest, cancelRequest } from "../shared/ride-transitions.ts";
const ride = {
  id: "r",
  driverId: "d",
  departureAt: "2099-01-01T10:00:00Z",
  status: "open",
  seatsAvailable: 1,
};
const request = { id: "q", rideId: "r", passengerId: "p", status: "pending" };
test("accept consumes the last seat; a second passenger cannot take it", () => {
  const result = decideRequest(ride, request, "d", "accept");
  assert.equal(result.ride.seatsAvailable, 0);
  assert.throws(
    () =>
      decideRequest(
        result.ride,
        { ...request, id: "q2", passengerId: "p2" },
        "d",
        "accept",
      ),
    /last seat/,
  );
});
test("repeated acceptance does not decrement twice", () => {
  const result = decideRequest(ride, request, "d", "accept");
  const retry = decideRequest(result.ride, result.request, "d", "accept");
  assert.equal(retry.ride.seatsAvailable, 0);
});
test("accepted cancellation restores capacity exactly once", () => {
  const accepted = decideRequest(ride, request, "d", "accept");
  const cancelled = cancelRequest(accepted.ride, accepted.request, "p");
  const retry = cancelRequest(cancelled.ride, cancelled.request, "p");
  assert.equal(retry.ride.seatsAvailable, 1);
});
test("pending cancellation does not create a spare seat", () =>
  assert.equal(cancelRequest(ride, request, "p").ride.seatsAvailable, 1));
test("another student cannot accept or cancel the request", () => {
  assert.throws(
    () => decideRequest(ride, request, "stranger", "accept"),
    /driver/,
  );
  assert.throws(() => cancelRequest(ride, request, "stranger"), /own request/);
});
test("closed or past rides reject acceptance", () => {
  assert.throws(() =>
    decideRequest({ ...ride, status: "cancelled" }, request, "d", "accept"),
  );
  assert.throws(() =>
    decideRequest(
      { ...ride, departureAt: "2000-01-01T00:00:00Z" },
      request,
      "d",
      "accept",
    ),
  );
});
