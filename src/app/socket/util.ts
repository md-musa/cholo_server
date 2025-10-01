import { LRUCache } from "lru-cache";
import { Server } from "socket.io";

/**
 * Trip-based speed cache. Keyed by tripId so average speed follows a trip session.
 */
export interface TripSpeedData {
  avgSpeed: number;
  samples: number;
}

export const tripSpeedCache = new LRUCache<string, TripSpeedData>({
  max: 100,
  ttl: 1000 * 60 * 30, // 30 minutes
});

/**
 * Maintain a rolling average speed for a given tripId.
 * Returns the updated average speed (or undefined if input invalid).
 */
export function updateTripSpeedAverage(tripId: string, speed?: number): number | undefined {
  if (speed === undefined || Number.isNaN(speed) || speed < 0) return undefined;

  let entry = tripSpeedCache.get(tripId);

  if (!entry) {
    entry = { avgSpeed: speed, samples: 1 };
  } else {
    entry.samples++;
    entry.avgSpeed = (entry.avgSpeed * (entry.samples - 1) + speed) / entry.samples;
  }

  tripSpeedCache.set(tripId, entry);
  return entry.avgSpeed;
}

/**
 * Safely get number of connected sockets in a room. Accepts io server instance.
 */
export function getRoomUserCount(io: Server, roomId: string): number {
  try {
    return io.sockets.adapter.rooms.get(roomId)?.size || 0;
  } catch (err) {
    // In some environments adapter.rooms may be undefined; return 0 as fallback
    return 0;
  }
}

/**
 * Return ISO timestamp string. Extracted to utils to make testing easier.
 */
export function nowIso(): string {
  return new Date().toISOString();
}
