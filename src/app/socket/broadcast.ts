import { LRUCache } from "lru-cache";
import { SOCKET_EVENTS, USER_ROLES } from "../../enums";
import { io } from "../../server";
import { TripModel, UserTripModel } from "../modules/trip/trip.model";
import { updateTripSpeedAverage, getRoomUserCount, nowIso } from "./util";
import { emitRouteLocationUpdate, getRecentlyUpdatedTrips } from "./tripUtil";

const tripCache = new LRUCache<string, any>({
  max: 100,
});

const activeTripsCache = new LRUCache<string, any>({
  max: 100,
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
 * Handle location updates sent by passengers or other non-driver users.
 * Loads the user trip from cache/DB and broadcasts to the route room.
 */
export async function handleUserLocationBroadcast(socket: any, data: IncomingLocationPayload) {
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
      console.log("✅ Cached UserTrip:", trip);
    }

    const { routeId, busName, direction, busType } = trip;

    const avgSpeed = updateTripSpeedAverage(tripId, speed) ?? 0;
    const currUserCnt = getRoomUserCount(io, routeId.toString());
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

    activeTripsCache.set(tripId, outgoing);

    emitRouteLocationUpdate(socket, routeId.toString(), outgoing);
  } catch (err) {
    console.error("❌ Error in handleUserLocationBroadcast:", err);
  }
}

/**
 * Handle location updates sent by drivers. Trip document includes assignment and bus details.
 */
// export async function handleDriverLocationBroadcast(socket: any, data: IncomingLocationPayload) {
//   console.log("📍 Driver location update received:", data);
//   const { tripId, latitude, longitude, heading, speed } = data;

//   try {
//     let trip = tripCache.get(tripId);

//     if (!trip) {
//       trip = await TripModel.findById(tripId)
//         .populate({
//           path: "assignmentId",
//           populate: [
//             { path: "busId", model: "Bus", select: "name" },
//             { path: "scheduleId", model: "Schedule", select: "time direction userType routeId" },
//           ],
//         })
//         .lean();

//       if (!trip) {
//         console.warn("❌ Trip not found for id:", tripId);
//         return;
//       }

//       tripCache.set(tripId, trip);
//       console.log("✅ Cached Trip:", tripId);
//     }

//     const busName: string | undefined = trip.assignmentId?.busId?.name;
//     const routeId: string = trip.assignmentId?.scheduleId?.routeId?.toString();
//     const direction = trip.assignmentId?.scheduleId?.direction;
//     const userType = trip.assignmentId?.scheduleId?.userType;

//     const avgSpeed = updateTripSpeedAverage(tripId, speed) ?? 0;
//     const currUserCnt = getRoomUserCount(io, routeId);
//     const timestamp = nowIso();

//     const outgoing: OutgoingLocationPayload = {
//       busName,
//       routeId,
//       direction,
//       userType,
//       latitude,
//       longitude,
//       heading,
//       speed,
//       avgSpeed,
//       currUserCnt,
//       timestamp,
//     };

//     emitRouteLocationUpdate(socket, routeId, outgoing);
//   } catch (err) {
//     console.error("❌ Error in handleDriverLocationBroadcast:", err);
//   }
// }

/**
 * Public entry point for broadcasting location updates. Decides which handler to call
 * based on broadcaster type.
 */
export async function handleLocationBroadcast(socket: any, data: IncomingLocationPayload) {
  if (data.broadcaster === "user") {
    return handleUserLocationBroadcast(socket, data);
  }

  // return handleDriverLocationBroadcast(socket, data);
}

export async function handleRouteJoin(socket: any, routeId: string) {
  socket.join(routeId);
  const currUserCnt = getRoomUserCount(io, routeId);

  const activeTripsFromCache = getRecentlyUpdatedTrips(activeTripsCache, routeId);
  console.log("🟢 Active trips from cache:", activeTripsFromCache);
  socket.emit(SOCKET_EVENTS.BUS_LOCATION_UPDATE, activeTripsFromCache);

  console.log(`➕ Client ${socket.id} joined route ${routeId}; cnt: ${currUserCnt}`);
}
