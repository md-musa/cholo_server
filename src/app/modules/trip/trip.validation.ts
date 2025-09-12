import { z } from "zod";
import { BUS_TYPES, TRIP_STATUS } from "../../../enums";

export const create = z.object({
  body: z.object({
    assignmentId: z.string({ required_error: "Assignment ID is required" }),
    status: z
      .enum([TRIP_STATUS.SCHEDULED, TRIP_STATUS.ONGOING, TRIP_STATUS.COMPLETED, TRIP_STATUS.CANCELED])
      .optional(),
    startTime: z.coerce.date().optional(),
    endTime: z.coerce.date().optional(),
    note: z.string().optional(),
  }),
});

export const TripValidation = {
  create,
};
