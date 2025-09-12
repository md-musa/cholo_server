import mongoose, { Schema, model } from "mongoose";
import { ITrip } from "./trip.interface";
import { TRIP_STATUS } from "../../../enums";

const tripSchema = new Schema<ITrip>(
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
);

export const TripModel = model<ITrip>("Trip", tripSchema);
