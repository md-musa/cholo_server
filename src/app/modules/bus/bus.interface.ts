import { Types } from "mongoose";
import { BUS_STATUS, BUS_TYPES } from "../../../enums";

export interface IBus {
  name: string;
  busType: BUS_TYPES;
  capacity: number;
  status: BUS_STATUS;
  assignedRouteId?: Types.ObjectId;
  assignedDriverId?: Types.ObjectId;
}
