import { z } from "zod";
import { BUS_STATUS, BUS_TYPES } from "../../../constants";

export const create = z.object({
  body: z.object({
    name: z.string().trim().nonempty("Bus name is required"),
    capacity: z.number().int().positive("Capacity must be a positive integer"),
    busType: z.enum([BUS_TYPES.STUDENT, BUS_TYPES.EMPLOYEE]),
    status: z.enum([BUS_STATUS.ACTIVE, BUS_STATUS.INACTIVE, BUS_STATUS.MAINTENANCE]).optional(),
    assignedRouteId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId")
      .optional(),
    assignedDriverId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId")
      .optional(),
  }),
});

export const update = z.object({
  body: z.object({
    name: z.string().trim().nonempty("Bus name is required").optional(),
    capacity: z.number().int().positive("Capacity must be a positive integer").optional(),
    busType: z.enum([BUS_TYPES.STUDENT, BUS_TYPES.EMPLOYEE]).optional(),
    status: z.enum([BUS_STATUS.ACTIVE, BUS_STATUS.INACTIVE, BUS_STATUS.MAINTENANCE]).optional(),
    assignedRouteId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId")
      .optional(),
    assignedDriverId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId")
      .optional(),
  }),
});

export const BusValidation = { create, update };
