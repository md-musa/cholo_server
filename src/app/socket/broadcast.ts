import { LRUCache } from "lru-cache";
import { SOCKET_EVENTS, USER_ROLES } from "../../enums";
import { io } from "../../server";
import { TripModel, UserTripModel } from "../modules/trip/trip.model";
import type { Server } from "socket.io";
import { updateTripSpeedAverage, getRoomUserCount, nowIso } from "./util";

/**
 * Local in-memory cache for trip documents to avoid DB lookups for every location update.
 * Key: tripId
 */
const tripCache = new LRUCache<string, any>({
  max: 100,
  ttl: 1000 * 60 * 5, // 5 minutes
});

export interface IncomingLocationPayload {
  broadcaster: "user" | "driver";
  tripId: string;
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number; // in m/s
}

export interface OutgoingLocationPayload {
  tripId?: string;
  busName?: string;
  routeId: string;
  direction?: string;
  userType?: string;
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  avgSpeed: number;
  currUserCnt: number;
  timestamp: string;
}

/**
 * Emit location payload to all clients subscribed to the route room.
 */
function emitRouteLocationUpdate(ioServer: Server, routeId: string, payload: OutgoingLocationPayload) {
  ioServer.to(routeId).emit(SOCKET_EVENTS.BUS_LOCATION_UPDATE, payload);
  console.log(
    `📡 Broadcasted on route ${routeId} — bus=${payload.busName || "-"} avgSpeed=${payload.avgSpeed.toFixed(
      2
    )} userCount=${payload.currUserCnt}`
  );
}

/**
 * Handle location updates sent by passengers or other non-driver users.
 * Loads the user trip from cache/DB and broadcasts to the route room.
 */
export async function handleUserLocationBroadcast(ioServer: Server, data: IncomingLocationPayload) {
  console.log("📍 User location update received:", data);
  const { tripId, latitude, longitude, heading, speed } = data;

  try {
    let trip = tripCache.get(tripId);

    if (!trip) {
      trip = await UserTripModel.findById(tripId).lean();
      if (!trip) {
        console.warn("❌ UserTrip not found for id:", tripId);
        return;
      }
      tripCache.set(tripId, trip);
      console.log("✅ Cached UserTrip:", tripId);
    }

    const { routeId, busName, direction, busType } = trip;

    const avgSpeed = updateTripSpeedAverage(tripId, speed) ?? 0;
    const currUserCnt = getRoomUserCount(ioServer, routeId.toString());
    const timestamp = nowIso();

    const outgoing: OutgoingLocationPayload = {
      tripId,
      busName,
      routeId: routeId.toString(),
      direction,
      userType: busType,
      latitude,
      longitude,
      heading,
      speed,
      avgSpeed,
      currUserCnt,
      timestamp,
    };

    emitRouteLocationUpdate(ioServer, routeId.toString(), outgoing);
  } catch (err) {
    console.error("❌ Error in handleUserLocationBroadcast:", err);
  }
}

/**
 * Handle location updates sent by drivers. Trip document includes assignment and bus details.
 */
export async function handleDriverLocationBroadcast(ioServer: Server, data: IncomingLocationPayload) {
  console.log("📍 Driver location update received:", data);
  const { tripId, latitude, longitude, heading, speed } = data;

  try {
    let trip = tripCache.get(tripId);

    if (!trip) {
      trip = await TripModel.findById(tripId)
        .populate({
          path: "assignmentId",
          populate: [
            { path: "busId", model: "Bus", select: "name" },
            { path: "scheduleId", model: "Schedule", select: "time direction userType routeId" },
          ],
        })
        .lean();

      if (!trip) {
        console.warn("❌ Trip not found for id:", tripId);
        return;
      }

      tripCache.set(tripId, trip);
      console.log("✅ Cached Trip:", tripId);
    }

    const busName: string | undefined = trip.assignmentId?.busId?.name;
    const routeId: string = trip.assignmentId?.scheduleId?.routeId?.toString();
    const direction = trip.assignmentId?.scheduleId?.direction;
    const userType = trip.assignmentId?.scheduleId?.userType;

    const avgSpeed = updateTripSpeedAverage(tripId, speed) ?? 0;
    const currUserCnt = getRoomUserCount(ioServer, routeId);
    const timestamp = nowIso();

    const outgoing: OutgoingLocationPayload = {
      busName,
      routeId,
      direction,
      userType,
      latitude,
      longitude,
      heading,
      speed,
      avgSpeed,
      currUserCnt,
      timestamp,
    };

    emitRouteLocationUpdate(ioServer, routeId, outgoing);
  } catch (err) {
    console.error("❌ Error in handleDriverLocationBroadcast:", err);
  }
}

/**
 * Public entry point for broadcasting location updates. Decides which handler to call
 * based on broadcaster type.
 */
export async function handleLocationBroadcast(ioServer: Server, data: IncomingLocationPayload) {
  if (data.broadcaster === "user") {
    return handleUserLocationBroadcast(ioServer, data);
  }

  return handleDriverLocationBroadcast(ioServer, data);
}
