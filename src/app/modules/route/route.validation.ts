import { z } from "zod";
import { STUDENT_DENSITY } from "../../../constants";

const create = z.object({
  body: z.object({
    routeNo: z
      .string()
      .min(2, "Route number must be at least 2 characters long")
      .max(3, "Route number must be at most 3 characters long")
      .regex(/^R\d+$/, "Route number must start with 'R' followed by digits")
      .nonempty("Route number is required"),

    routeName: z
      .string()
      .nonempty("Route name is required")
      .transform((val) => val.toLowerCase()),
    totalDistance: z.number().positive("Total distance must be positive").optional(),
    estimatedTime: z.number().positive("Estimated time must be positive").optional(),
    wayline: z.any().optional(),
    assignedBuses: z.array(z.string()).optional(),
    waypoints: z
      .array(
        z.object({
          location: z.string().optional(),
          latitude: z.number().optional(),
          longitude: z.number().optional(),
          studentDensity: z.enum([STUDENT_DENSITY.LOW, STUDENT_DENSITY.MEDIUM, STUDENT_DENSITY.HIGH]).optional(),
        })
      )
      .optional(),
  }),
});

export const update = z.object({
  body: z.object({
    routeNo: z
      .string()
      .min(2, "Route number must be at least 2 characters long")
      .max(3, "Route number must be at most 3 characters long")
      .regex(/^R\d+$/, "Route number must start with 'R' followed by digits")
      .optional(),

    routeName: z
      .string()
      .optional()
      .transform((val) => (val !== undefined ? val.toLowerCase() : val)),
    totalDistance: z.number().positive("Total distance must be positive").optional(),
    estimatedTime: z.number().positive("Estimated time must be positive").optional(),
    wayline: z.any().optional(),
    assignedBuses: z.array(z.string()).optional(),
    waypoints: z
      .array(
        z.object({
          location: z.string().optional(),
          latitude: z.number().optional(),
          longitude: z.number().optional(),
          studentDensity: z.enum([STUDENT_DENSITY.LOW, STUDENT_DENSITY.MEDIUM, STUDENT_DENSITY.HIGH]).optional(),
        })
      )
      .optional(),
  }),
});

export const RouteValidation = {
  create,
  update,
};
