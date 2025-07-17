import haversine from "haversine";
import * as turf from "@turf/turf";

export const getNearestStop = (location, stops) => {
  let minDistance = Infinity;
  let nearestStop = null;

  stops.forEach((stop) => {
    const distance = haversine(location, {
      latitude: stop.coords[1],
      longitude: stop.coords[0],
    });

    if (distance < minDistance) {
      minDistance = distance;
      nearestStop = stop;
    }
  });

  return nearestStop;
};

export function findNearestStop(userCoords, routeLine, stopages) {
  const userPoint = turf.point(userCoords);
  routeLine = turf.lineString(routeLine);

  // 1. Snap user to route
  const snapped = turf.nearestPointOnLine(routeLine, userPoint);
  const routeStart = turf.point(routeLine.geometry.coordinates[0]);

  const userDist = turf.length(turf.lineSlice(routeStart, snapped, routeLine), { units: "kilometers" });

  // 2. Calculate each stop's along-route distance
  const stopsWithDist = stopages.map((stopage) => {
    const stopPoint = turf.point(stopage.coords);
    const stopDist = turf.length(turf.lineSlice(routeStart, stopPoint, routeLine), { units: "kilometers" });
    return { ...stopage, stopDist };
  });

  // 3. Find stop with minimum distance difference
  let nearest = null;
  let minDiff = Infinity;

  stopsWithDist.forEach((s) => {
    const diff = Math.abs(userDist - s.stopDist);
    if (diff < minDiff) {
      minDiff = diff;
      nearest = s;
    }
  });

  return nearest;
}
