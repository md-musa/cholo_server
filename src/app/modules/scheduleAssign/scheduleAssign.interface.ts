import { Document, Types } from "mongoose";

export interface IAssignment extends Document {
  scheduleId: Types.ObjectId;
  busId?: Types.ObjectId;
  driverId?: Types.ObjectId;
  workingDays?: ("sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday")[];
}
