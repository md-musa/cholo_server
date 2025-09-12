import { z } from "zod";

const ScheduleAssignmentValidation = {
  create: z.object({
    body: z.object({
      scheduleId: z.string().nonempty("scheduleId is required"),
      busId: z.string().optional(),
      driverId: z.string().optional(),
      workingDays: z
        .array(z.enum(["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]))
        .optional(),
    }),
  }),

  update: z.object({
    body: z.object({
      scheduleId: z.string().optional(),
      busId: z.string().optional(),
      driverId: z.string().optional(),
      workingDays: z
        .array(z.enum(["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]))
        .optional(),
    }),
  }),
};

export default ScheduleAssignmentValidation;
