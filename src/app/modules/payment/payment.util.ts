import haversine from "haversine";
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
