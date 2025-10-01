import { z } from "zod";

// Days of the week
const WeekDaysEnum = z.enum(["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]);

// Assignment type
const AssignmentTypeEnum = z.enum(["fixed", "one-off"]);

const ScheduleAssignmentValidation = {
  create: z.object({
    body: z.object({
      scheduleId: z.string().nonempty("scheduleId is required"),
      busId: z.string().optional(),
      driverId: z.string().optional(),
      workingDays: z.array(WeekDaysEnum).optional(),
      assignmentType: AssignmentTypeEnum.default("fixed"),
      specificDate: z.date().optional(),
    }),
  }),

  update: z.object({
    body: z.object({
      scheduleId: z.string().optional(),
      busId: z.string().optional(),
      driverId: z.string().optional(),
      workingDays: z.array(WeekDaysEnum).optional(),
      assignmentType: AssignmentTypeEnum.optional(),
      specificDate: z.date().optional(),
    }),
  }),
};

export default ScheduleAssignmentValidation;
