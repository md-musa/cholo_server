import { LRUCache } from "lru-cache";
import { SOCKET_EVENTS } from "../../enums";
import { io } from "../../server";
import { TripModel, UserTripModel } from "../modules/trip/trip.model";

// Cache for trips (max 100 entries, 5 minutes TTL)
const tripCache = new LRUCache<string, any>({
  max: 100,
  ttl: 1000 * 60 * 5,
});

// Cache for average bus speeds (max 100 buses, 10 minutes TTL)
const speedCache = new LRUCache<string, { avgSpeed: number; samples: number }>({
  max: 100,
  ttl: 1000 * 60 * 10,
});

/**
 * Update rolling average speed using busName as unique key.
 */
function updateSpeedCache(busName: string, speed: number | undefined) {
  if (speed === undefined || speed < 0) return;

  let speedData = speedCache.get(busName);

  if (!speedData) {
    speedData = { avgSpeed: speed, samples: 1 };
  } else {
    speedData.samples++;
    speedData.avgSpeed = (speedData.avgSpeed * (speedData.samples - 1) + speed) / speedData.samples;
  }

  speedCache.set(busName, speedData);
  return speedData.avgSpeed;
}

/**
 * Broadcasts a location update to all clients in a route room.
 */
function emitLocationUpdate(routeId: string, payload: any) {
  io.to(routeId).emit(SOCKET_EVENTS.BUS_LOCATION_UPDATE, payload);
  console.log(
    `📡 Broadcasted bus ${payload.busName} | AvgSpeed: ${payload.avgSpeed?.toFixed(2) || 0} | UserCnt: ${
      payload.currUserCnt
    }`
  );
}

/**
 * Broadcast location when sent by passenger or other user.
 */
async function broadcastLocationByUser(data: any) {
  console.log("📍 Location update from user:", data);
  const { tripId, latitude, longitude, heading, speed } = data;

  try {
    let trip = tripCache.get(tripId);

    if (!trip) {
      trip = await UserTripModel.findById(tripId).lean();
      if (!trip) {
        console.log("❌ User trip not found:", tripId);
        return;
      }
      tripCache.set(tripId, trip); // Cache user trip
    }

    const { routeId, busName, direction, busType } = trip;

    // Update rolling average speed
    const avgSpeed = updateSpeedCache(busName, speed) || 0;

    const currUserCnt = io.sockets.adapter.rooms.get(routeId.toString())?.size || 0;
    const timestamp = new Date().toISOString();

    const broadcaster = {
      busName,
      routeId,
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

    emitLocationUpdate(routeId, broadcaster);
  } catch (error) {
    console.error("❌ Error broadcasting location by user:", error);
  }
}

/**
 * Broadcast location when sent by driver.
 */
async function broadcastLocationByDriver(data: any) {
  console.log("📍 Location update from driver:", data);
  const { tripId, latitude, longitude, heading, speed } = data;

  try {
    let trip = tripCache.get(tripId);

    if (!trip) {
      trip = await TripModel.findById(tripId)
        .populate({
          path: "assignmentId",
          populate: [
            { path: "busId", model: "Bus", select: "name" },
            {
              path: "scheduleId",
              model: "Schedule",
              select: "time direction userType routeId",
            },
          ],
        })
        .lean();

      if (!trip) {
        console.log("❌ Trip not found:", tripId);
        return;
      }

      tripCache.set(tripId, trip); // Cache driver trip
      console.log("✅ Trip cached:", tripId);
    }

    const busName = trip.assignmentId.busId.name;
    const routeId = trip.assignmentId.scheduleId.routeId.toString();

    // Update average speed using busName
    const avgSpeed = updateSpeedCache(busName, speed) || 0;

    const currUserCnt = io.sockets.adapter.rooms.get(routeId)?.size || 0;
    const timestamp = new Date().toISOString();

    const broadcaster = {
      busName,
      direction: trip.assignmentId.scheduleId.direction,
      userType: trip.assignmentId.scheduleId.userType,
      routeId,
      latitude,
      longitude,
      heading,
      speed,
      avgSpeed,
      currUserCnt,
      timestamp,
    };

    emitLocationUpdate(routeId, broadcaster);
  } catch (error) {
    console.error("❌ Error broadcasting location by driver:", error);
  }
}

/**
 * Main broadcast handler
 */
export async function broadcastLocation(data: any) {
  if (data.broadcaster === "user") {
    return broadcastLocationByUser(data);
  }

  return broadcastLocationByDriver(data);
}
