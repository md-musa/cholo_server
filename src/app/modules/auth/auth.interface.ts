import { Schema } from "mongoose";
import { USER_ROLES } from "../../../enums";

export interface IUser {
  name: string;
  email: string;
  role: USER_ROLES.EMPLOYEE | USER_ROLES.STUDENT | USER_ROLES.ADMIN | USER_ROLES.SUPER_ADMIN;
  phoneNumber?: string;
  password: string;
  houseCoords?: [number, number];
  routeId: Schema.Types.ObjectId;
  notificationToken?: string;
}
