import mongoose, { Schema } from "mongoose";

const assignmentSchema = new Schema(
  {
    scheduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Schedule",
      required: true,
    },
    busId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bus",
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    assignmentType: {
      type: String,
      enum: ["fixed", "one-off"],
      default: "fixed",
    },
    specificDate: {
      type: Date, // required only if one-off
    },
    workingDays: [
      {
        type: String,
        enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
      },
    ],
  },
  { timestamps: true }
);

const AssignmentModel = mongoose.model("Assignment", assignmentSchema);

export default AssignmentModel;
