import mongoose, { Schema } from "mongoose";

const scheduleAssignmentSchema = new Schema(
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
    workingDays: [
      {
        type: String,
        enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
      },
    ],
  },
  { timestamps: true }
);

const ScheduleAssignmentModel = mongoose.model("ScheduleAssignment", scheduleAssignmentSchema);

export default ScheduleAssignmentModel;
