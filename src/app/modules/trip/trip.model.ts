import mongoose, { Schema, model } from "mongoose";
import { ITrip, IUserTrip } from "./trip.interface";
import { BUS_TYPES, TRIP_STATUS } from "../../../enums";

export const TripModel = model<ITrip>(
  "driver_trip",
  new Schema<ITrip>(
    {
      assignmentId: { type: Schema.Types.ObjectId, ref: "ScheduleAssignment", required: true },
      status: {
        type: String,
        enum: Object.values(TRIP_STATUS),
        default: TRIP_STATUS.SCHEDULED,
        required: true,
      },

      startTime: { type: Date, default: Date.now },
      endTime: { type: Date },
      note: { type: String },
    },
    { timestamps: true }
  )
);

export const UserTripModel = model<IUserTrip>(
  "user_trip",
  new Schema<IUserTrip>(
    {
      routeId: { type: Schema.Types.ObjectId, ref: "Route", required: true },
      hostId: { type: Schema.Types.ObjectId, ref: "User", required: true },
      busName: { type: String, required: true },
      departureTime: { type: Date, required: false },
      direction: { type: String, required: true },
      status: {
        type: String,
        enum: [TRIP_STATUS.SCHEDULED, TRIP_STATUS.DEPARTED, TRIP_STATUS.COMPLETED, TRIP_STATUS.CANCELED],
        required: false,
      },

      busType: { type: String, enum: Object.values(BUS_TYPES), required: true },
      note: { type: String, required: false },
    },
    { timestamps: true }
  )
);
