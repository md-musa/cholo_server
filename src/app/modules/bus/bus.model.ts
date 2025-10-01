import mongoose, { Schema } from "mongoose";
import { IBus } from "./bus.interface";
import { BUS_STATUS, BUS_TYPES } from "../../../enums";

const BusSchema = new Schema<IBus>(
  {
    name: {
      type: String,
      unique: true,
      lowercase: true,
      required: true,
      trim: true,
    },
    busType: {
      type: String,
      enum: [BUS_TYPES.STUDENT, BUS_TYPES.EMPLOYEE],
      required: true,
    },
    capacity: {
      type: Number,
      min: 1,
    },
    status: {
      type: String,
      enum: [BUS_STATUS.ACTIVE, BUS_STATUS.INACTIVE, BUS_STATUS.MAINTENANCE],
      default: BUS_STATUS.ACTIVE,
    },
    assignedRouteId: {
      type: Schema.Types.ObjectId,
      ref: "Route",
    },
    assignedDriverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const BusModel = mongoose.model<IBus>("Bus", BusSchema);
