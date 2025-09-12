import { Schema } from "mongoose";
import { BUS_TYPES, TRIP_STATUS } from "../../../enums";

export interface ITrip {
  assignmentId: Schema.Types.ObjectId;
  status: TRIP_STATUS.SCHEDULED | TRIP_STATUS.ONGOING | TRIP_STATUS.COMPLETED | TRIP_STATUS.CANCELED;
  startTime: Date;
  endTime?: Date;
  note?: string;
}
