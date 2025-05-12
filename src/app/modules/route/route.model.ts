import mongoose, { Schema, model } from "mongoose";
import { STUDENT_DENSITY } from "../../../constants";
import { IRoute } from "./route.interface";

const routeSchema = new Schema<IRoute>(
  {
    name: { type: String, required: true, unique: true },
    startLocation: { type: String, required: true },
    endLocation: { type: String, required: true, unique: true },
    totalDistance: { type: Number }, // optional
    estimatedTime: { type: Number }, // optional

    wayline: {
      type: Schema.Types.Mixed, // replaces invalid `JSON`
    },

    assignedBuses: [
      {
        type: Schema.Types.ObjectId,
        unique: true,
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
