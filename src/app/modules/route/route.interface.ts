import { STUDENT_DENSITY } from "../../../constants";

export interface IRoute {
  routeNo: string;
  routeName: string;
  totalDistance?: number; // in kilometers
  estimatedTime?: number; // in minutes
  wayline?: unknown; // matches Mongoose Mixed
  assignedBuses?: string[]; // array of ObjectIds as strings
  waypoints?: {
    location?: string;
    latitude?: number;
    longitude?: number;
    studentDensity?: STUDENT_DENSITY.LOW | STUDENT_DENSITY.MEDIUM | STUDENT_DENSITY.HIGH;
  }[];
}
