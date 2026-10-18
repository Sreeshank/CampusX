import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowRight,
  Plus,
  CarFront,
  MapPin,
  Clock3,
  Users,
  ArrowLeft,
} from "lucide-react";
import { POINTS, pointLabel } from "../../../shared/constants";
import { api, useDemo } from "../../lib/demo/store";
import {
  PageHead,
  Avatar,
  Empty,
  Status,
  ErrorBox,
  useAction,
} from "../../components/ui";
import {
  dateTime,
  money,
  localDay,
  istInput,
  fromIstInput,
} from "../../lib/format";
import type { Ride } from "../../../shared/types";
function RideCard({ ride }: { ride: Ride }) {
  const s = useDemo();
  const driver = s.users.find((u) => u.id === ride.driverId)!;
  return (
    <article className="ride-card">
      <div className="ride-driver">
        <Avatar name={driver.displayName} />
        <div>
          <strong>{driver.displayName}</strong>
          <small>
            {ride.vehicleType === "twoWheeler" ? "Two-wheeler" : "Shared ride"}{" "}
            · KITS Warangal
          </small>
        </div>
        <Status>
          {ride.status === "open" && ride.seatsAvailable === 0
            ? "full"
            : ride.status}
        </Status>
      </div>
      <div className="route-line">
        <div>
          <MapPin size={17} />
          <b>{pointLabel(ride.pickupPointId)}</b>
        </div>
        <ArrowRight size={19} />
        <div>
          <MapPin size={17} />
          <b>{pointLabel(ride.destinationPointId)}</b>
        </div>
      </div>
      <div className="ride-meta">
        <span>
          <Clock3 size={15} />
          {dateTime(ride.departureAt)} IST
        </span>
        <span>
          <Users size={15} />
          {ride.seatsAvailable} seats left
        </span>
      </div>
      <div className="ride-bottom">
        <div>
          <strong>{money(ride.costSharePaise)}</strong>
          <small>cost share / seat</small>
        </div>
        <Link className="button secondary" to={`/xride/${ride.id}`}>
          View ride <ArrowRight size={16} />
        </Link>
      </div>
    </article>
  );
}
export function Rides() {
  const s = useDemo();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [day, setDay] = useState("");
  const items = s.rides.filter(
    (r) =>
      r.status === "open" &&
      Date.parse(r.departureAt) > Date.now() &&
      (!from || r.pickupPointId === from) &&
      (!to || r.destinationPointId === to) &&
      (!day || localDay(r.departureAt) === day),
  );
  return (
    <>
      <PageHead
        eyebrow="XRIDE · GO TOGETHER"
        title="Find someone going your way."
        description="Scheduled rides, shared costs, and a little company along the way."
      >
        <Link className="button primary" to="/xride/new">
          <Plus size={18} />
          Offer a ride
        </Link>
      </PageHead>
      <div className="tabs">
        <Link className="selected" to="/xride">
          Find rides
        </Link>
        <Link to="/my-rides">My rides & requests</Link>
      </div>
      <div className="ride-search form-grid">
        <label>
          From
          <select value={from} onChange={(e) => setFrom(e.target.value)}>
            <option value="">Any pickup</option>
            {POINTS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          To
          <select value={to} onChange={(e) => setTo(e.target.value)}>
            <option value="">Any destination</option>
            {POINTS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Date (IST)
          <input
            type="date"
            value={day}
            onChange={(e) => setDay(e.target.value)}
          />
        </label>
      </div>
      <div className="result-caption">{items.length} upcoming rides</div>
      <div className="ride-grid">
        {items.map((r) => (
          <RideCard key={r.id} ride={r} />
        ))}
      </div>
      {!items.length && (
        <Empty
          title="No rides on this route yet"
          text="Try another date or offer a ride of your own."
          href="/xride/new"
          action="Offer a ride"
        />
      )}
    </>
  );
}
export function RideForm() {
  const navigate = useNavigate();
  const { error, run } = useAction();
  const [key] = useState(() => crypto.randomUUID());
  return (
    <>
      <PageHead
        eyebrow="XRIDE"
        title="A spare seat is a shared journey."
        description="Offer a scheduled ride from a public meeting point."
      />
      <form
        className="form-card"
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          run(() => {
            const result = api.createRide({
              pickupPointId: String(f.get("from")),
              destinationPointId: String(f.get("to")),
              departureAt: fromIstInput(String(f.get("time"))),
              seatsTotal: Number(f.get("seats")),
              costSharePaise: Math.round(Number(f.get("cost")) * 100),
              vehicleType: String(f.get("vehicle")) as Ride["vehicleType"],
              notes: String(f.get("notes")),
              idempotencyKey: key,
            });
            navigate(`/xride/${result.rideId}`);
          });
        }}
      >
        <ErrorBox message={error} />
        <div className="form-grid">
          <label>
            Pickup point
            <select name="from" defaultValue="kits-main-gate">
              {POINTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Destination
            <select name="to" defaultValue="hanamkonda">
              {POINTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Departure (India time / IST)
            <input
              required
              name="time"
              type="datetime-local"
              defaultValue={istInput(new Date(Date.now() + 86400000))}
            />
          </label>
          <label>
            Vehicle
            <select name="vehicle">
              <option value="car">Car</option>
              <option value="twoWheeler">Two-wheeler</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label>
            Passenger seats
            <input
              name="seats"
              type="number"
              min="1"
              max="6"
              required
              defaultValue="1"
            />
          </label>
          <label>
            Cost share per seat (₹)
            <input
              name="cost"
              type="number"
              min="0"
              step="0.01"
              required
              defaultValue="40"
            />
          </label>
        </div>
        <label>
          Pickup notes
          <textarea
            name="notes"
            maxLength={500}
            rows={3}
            placeholder="Where should your passenger meet you?"
          />
        </label>
        <div className="info-box">
          This is a scheduled shared ride. Seat requests need your acceptance.
        </div>
        <div className="form-footer">
          <Link to="/xride">Cancel</Link>
          <button className="button primary">Publish ride</button>
        </div>
      </form>
    </>
  );
}
export function RideDetail() {
  const { rideId } = useParams();
  const s = useDemo();
  const r = s.rides.find((r) => r.id === rideId);
  const { error, run } = useAction();
  const [key] = useState(() => crypto.randomUUID());
  const navigate = useNavigate();
  if (!r)
    return (
      <Empty
        title="Ride unavailable"
        text="This ride could not be found."
        href="/xride"
        action="Find rides"
      />
    );
  const own = r.driverId === s.currentUserId;
  const q = s.requests.find(
    (q) => q.rideId === r.id && q.passengerId === s.currentUserId,
  );
  const driver = s.users.find((u) => u.id === r.driverId)!;
  return (
    <>
      <Link className="back-link" to="/xride">
        <ArrowLeft size={16} />
        Back to rides
      </Link>
      <PageHead
        eyebrow="XRIDE · RIDE DETAILS"
        title={`${pointLabel(r.pickupPointId)} to ${pointLabel(r.destinationPointId)}`}
        description={`${dateTime(r.departureAt)} IST`}
      />
      <div className="detail-grid">
        <div className="route-panel">
          <CarFront size={48} />
          <h2>Your shared journey</h2>
          <div className="route-stop">
            <i />
            {pointLabel(r.pickupPointId)}
          </div>
          <div className="route-dashes" />
          <div className="route-stop">
            <i />
            {pointLabel(r.destinationPointId)}
          </div>
          <small>Pickup reference · no live tracking</small>
        </div>
        <div className="panel">
          <div className="seller">
            <Avatar name={driver.displayName} />
            <div>
              <strong>{driver.displayName}</strong>
              <small>{driver.department}</small>
            </div>
          </div>
          <div className="detail-price">
            {money(r.costSharePaise)} <small>/ seat</small>
          </div>
          <p>
            {r.seatsAvailable} of {r.seatsTotal} passenger seats available
          </p>
          <Status>{r.status}</Status>
          <p>{r.notes || "Coordinate the meeting point with the driver."}</p>
          <ErrorBox message={error} />
          {own ? (
            <Link className="button primary" to="/my-rides">
              Manage requests
            </Link>
          ) : q ? (
            <>
              <p>
                Your request:{" "}
                <Status>
                  {r.status === "cancelled" ? "cancelled" : q.status}
                </Status>
              </p>
              <button
                className="button secondary"
                onClick={() =>
                  run(() => {
                    const c = api.openConversation("ride", r.id, r.driverId);
                    navigate(`/messages/${c.conversationId}`);
                  })
                }
              >
                Message driver
              </button>
            </>
          ) : (
            <button
              className="button primary full"
              disabled={
                r.status !== "open" ||
                r.seatsAvailable === 0 ||
                Date.parse(r.departureAt) <= Date.now()
              }
              onClick={() =>
                run(() => {
                  api.requestRide(r.id, key);
                })
              }
            >
              Request one seat
            </button>
          )}
          <p className="fine-print">
            Pending requests do not reserve a seat. Wait for the driver's
            acceptance.
          </p>
        </div>
      </div>
    </>
  );
}
export function MyRides() {
  const s = useDemo();
  const { error, run } = useAction();
  const offers = s.rides.filter((r) => r.driverId === s.currentUserId);
  const requests = s.requests.filter((q) => q.passengerId === s.currentUserId);
  return (
    <>
      <PageHead
        eyebrow="XRIDE"
        title="Your journeys, in one place."
        description="Manage your offers and keep track of your seat requests."
      />
      <ErrorBox message={error} />
      <h2 className="subheading">Rides you offered</h2>
      {offers.length ? (
        offers.map((r) => (
          <div className="panel manage-ride" key={r.id}>
            <div className="split">
              <div>
                <h3>
                  {pointLabel(r.pickupPointId)} →{" "}
                  {pointLabel(r.destinationPointId)}
                </h3>
                <p>
                  {dateTime(r.departureAt)} IST · {r.seatsAvailable} seats
                  available
                </p>
              </div>
              <Status>{r.status}</Status>
            </div>
            {s.requests
              .filter((q) => q.rideId === r.id)
              .map((q) => (
                <div className="request-row" key={q.id}>
                  <span>
                    <b>
                      {s.users.find((u) => u.id === q.passengerId)?.displayName}
                    </b>{" "}
                    <Status>{q.status}</Status>
                  </span>
                  {q.status === "pending" && r.status === "open" && (
                    <div className="actions">
                      <button
                        className="button primary small"
                        onClick={() =>
                          run(() => {
                            api.respondToRideRequest(
                              q.id,
                              "accept",
                              crypto.randomUUID(),
                            );
                          })
                        }
                      >
                        Accept request
                      </button>
                      <button
                        className="button secondary small"
                        onClick={() =>
                          run(() => {
                            api.respondToRideRequest(
                              q.id,
                              "reject",
                              crypto.randomUUID(),
                            );
                          })
                        }
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            {!s.requests.some((q) => q.rideId === r.id) && (
              <p className="muted">No requests yet.</p>
            )}
            {r.status === "open" &&
              (Date.parse(r.departureAt) > Date.now() ? (
                <button
                  className="text-button"
                  onClick={() => {
                    if (confirm("Cancel this ride and all its requests?"))
                      run(() => api.cancelRide(r.id));
                  }}
                >
                  Cancel ride
                </button>
              ) : (
                <button
                  className="button secondary"
                  onClick={() => run(() => api.completeRide(r.id))}
                >
                  Mark completed
                </button>
              ))}
          </div>
        ))
      ) : (
        <Empty
          title="No ride offers yet"
          text="Have a spare seat? Offer it to a fellow student."
          href="/xride/new"
          action="Offer a ride"
        />
      )}
      <h2 className="subheading">Your seat requests</h2>
      {requests.length ? (
        requests.map((q) => {
          const r = s.rides.find((r) => r.id === q.rideId)!;
          return (
            <div className="panel request-row" key={q.id}>
              <div>
                <Link to={`/xride/${r.id}`}>
                  <b>
                    {pointLabel(r.pickupPointId)} →{" "}
                    {pointLabel(r.destinationPointId)}
                  </b>
                </Link>
                <p>{dateTime(r.departureAt)} IST</p>
                <Status>
                  {r.status === "cancelled" ? "cancelled" : q.status}
                </Status>
              </div>
              {r.status === "open" &&
                ["pending", "accepted"].includes(q.status) &&
                Date.parse(r.departureAt) > Date.now() && (
                  <button
                    className="button secondary"
                    onClick={() =>
                      run(() => {
                        api.cancelRideRequest(q.id, crypto.randomUUID());
                      })
                    }
                  >
                    Cancel request
                  </button>
                )}
            </div>
          );
        })
      ) : (
        <Empty
          title="No requests yet"
          text="Find a ride and request a seat."
          href="/xride"
          action="Find rides"
        />
      )}
    </>
  );
}
