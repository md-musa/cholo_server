import moment from "moment";
import { OutgoingLocationPayload } from "./broadcast";
import { LRUCache } from "lru-cache";
import { SOCKET_EVENTS } from "../../enums";
import { io } from "../../server";

/**
 * Returns trips updated within the last 1.5 minutes for a specific route.
 */
export function getRecentlyUpdatedTrips(cache: LRUCache<string, any>, routeId: string): OutgoingLocationPayload[] {
  const oneAndHalfMinutesAgo = moment().subtract(90, "seconds"); // 1.5 minutes = 90 seconds

  const recentTrips: OutgoingLocationPayload[] = [];

  for (const trip of cache.values()) {
    if (
      trip.routeId === routeId && // filter by route
      moment(trip.timestamp).isAfter(oneAndHalfMinutesAgo) // filter by last 1.5 minutes
    ) {
      recentTrips.push(trip);
    }
  }

  return recentTrips;
}

/**
 * Emit location payload to all clients subscribed to the route room.
 */
let cnt = 0;
export function emitRouteLocationUpdate(socket: any, routeId: string, payload: OutgoingLocationPayload) {
  io.to(routeId).emit(SOCKET_EVENTS.BUS_LOCATION_UPDATE, payload);
  console.log(`📡 Broadcasted [${++cnt}]`, payload);
}
