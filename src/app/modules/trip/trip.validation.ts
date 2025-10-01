import { z } from "zod";
import { BUS_TYPES, TRIP_STATUS } from "../../../enums";

export const TripValidation = {
  create: z.object({
    body: z.object({
      assignmentId: z.string({ required_error: "Assignment ID is required" }),
      status: z
        .enum([TRIP_STATUS.SCHEDULED, TRIP_STATUS.DEPARTED, TRIP_STATUS.COMPLETED, TRIP_STATUS.CANCELED])
        .optional(),
      startTime: z.coerce.date().optional(),
      endTime: z.coerce.date().optional(),
      note: z.string().optional(),
    }),
  }),
  update: z.object({
    body: z.object({
      assignmentId: z.string({ required_error: "Assignment ID is required" }).optional(),
      status: z
        .enum([TRIP_STATUS.SCHEDULED, TRIP_STATUS.DEPARTED, TRIP_STATUS.COMPLETED, TRIP_STATUS.CANCELED])
        .optional(),
      startTime: z.coerce.date().optional(),
      endTime: z.coerce.date().optional(),
      note: z.string().optional(),
    }),
  }),

  userTripCreate: z.object({
    body: z.object({
      routeId: z.string().nonempty("Route ID is required"),
      hostId: z.string().nonempty("Host ID is required"),
      busName: z.string().nonempty("Bus name is required"),
      departureTime: z.coerce.date().optional(),
      busType: z.enum([BUS_TYPES.STUDENT, BUS_TYPES.EMPLOYEE]),
      direction: z.string().nonempty("Direction is required"),
      status: z
        .enum([TRIP_STATUS.SCHEDULED, TRIP_STATUS.DEPARTED, TRIP_STATUS.COMPLETED, TRIP_STATUS.CANCELED])
        .optional(),
      note: z.string().optional(),
    }),
  }),
};
