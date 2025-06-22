import mongoose, { Schema, model } from "mongoose";
import { STUDENT_DENSITY } from "../../../constants";
import { IRoute } from "./route.interface";

const routeSchema = new Schema<IRoute>(
  {
    routeNo: { type: String, required: true, unique: true },
    routeName: { type: String, required: true, unique: true },
    totalDistance: { type: Number },
    estimatedTime: { type: Number },

    wayline: {
      type: Schema.Types.Mixed, // replaces invalid `JSON`
    },

    assignedBuses: [
      {
        type: Schema.Types.ObjectId,
        ref: "Bus",
      },
    ],

    waypoints: [
      {
        location: { type: String },
        latitude: { type: Number },
        longitude: { type: Number },
        studentDensity: {
          type: String,
          enum: [STUDENT_DENSITY.LOW, STUDENT_DENSITY.MEDIUM, STUDENT_DENSITY.HIGH],
        },
        _id: false,
      },
    ],
  },
  { timestamps: true }
);

export const RouteModel = model<IRoute>("Route", routeSchema);
