import { TRIP_STATUS } from "../../../enums";
import ApiError from "../../../errors/ApiError";
import { ITrip } from "./trip.interface";
import { TripModel } from "./trip.model";

export const TripService = {
  create: async (tripData: ITrip) => {
    const trip = await TripModel.create(tripData);
    return trip;
  },

  update: async (id: string, payload: Partial<ITrip>) => {
    let trip = await TripModel.findById(id);
    console.log(trip);
    if (!trip) throw ApiError.notFound("Trip not found");

    // Prevent updating if trip is already completed or ongoing (and trying to cancel)
    if (
      payload.status === TRIP_STATUS.CANCELED &&
      (trip.status === TRIP_STATUS.ONGOING || trip.status === TRIP_STATUS.COMPLETED)
    ) {
      throw ApiError.badRequest("Cannot cancel an ongoing or completed trip");
    }

    // If trip is starting
    if (payload.status === TRIP_STATUS.ONGOING && trip.status === TRIP_STATUS.SCHEDULED) {
      payload.startTime = new Date();
    }

    // If trip is being completed
    if (payload.status === TRIP_STATUS.COMPLETED && trip.status === TRIP_STATUS.ONGOING) {
      payload.endTime = new Date();
    }

    trip = await TripModel.findByIdAndUpdate(id, payload, { new: true });
    return trip;
  },

  getById: async (id: string) => {
    const trip = await TripModel.findById(id);
    if (!trip) throw ApiError.notFound("Trip not found");
    return trip;
  },

  getAll: async () => {
    const trips = await TripModel.find().lean();
    return trips;
  },

  delete: async (id: string) => {
    const trip = await TripModel.findByIdAndDelete(id);
    return trip;
  },
};
