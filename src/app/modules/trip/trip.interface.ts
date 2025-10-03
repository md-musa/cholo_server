import { Schema } from "mongoose";
import { BUS_TYPES, TRIP_STATUS } from "../../../enums";

export interface ITrip {
  assignmentId: Schema.Types.ObjectId;
  status: TRIP_STATUS.SCHEDULED | TRIP_STATUS.DEPARTED | TRIP_STATUS.COMPLETED | TRIP_STATUS.CANCELED;
  startTime: Date;
  endTime?: Date;
  note?: string;
}


export interface IUserTrip {
  routeId: Schema.Types.ObjectId | string;
  hostId: Schema.Types.ObjectId | string;
  busName: string;
  departureTime?: Date;
  direction: string;
  status: TRIP_STATUS.SCHEDULED | TRIP_STATUS.DEPARTED | TRIP_STATUS.COMPLETED | TRIP_STATUS.CANCELED;
  busType: BUS_TYPES.STUDENT | BUS_TYPES.EMPLOYEE;
  note?: string;
}