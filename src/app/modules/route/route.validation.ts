import { z } from "zod";
import { STUDENT_DENSITY } from "../../../constants";

 const create = z.object({
  body: z.object({
    name: z.string().nonempty("Route name is required"),
    startLocation: z.string().nonempty("Start location is required"),
    endLocation: z.string().nonempty("End location is required"),
    totalDistance: z.number().positive("Total distance must be positive").optional(),
    estimatedTime: z.number().positive("Estimated time must be positive").optional(),
    wayline: z.any().optional(), // Mongoose Schema.Types.Mixed
    assignedBuses: z.array(z.string()).optional(), // Expecting array of ObjectIds (strings)
    waypoints: z
      .array(
        z.object({
          location: z.string().optional(),
          latitude: z.number().optional(),
          longitude: z.number().optional(),
          studentDensity: z
            .enum([STUDENT_DENSITY.LOW, STUDENT_DENSITY.MEDIUM, STUDENT_DENSITY.HIGH])
            .optional(),
        })
      )
      .optional(),
  }),
});


export const update = z.object({
  body: z.object({
    name: z.string().nonempty().optional(),
    startLocation: z.string().nonempty().optional(),
    endLocation: z.string().nonempty().optional(),
    totalDistance: z.number().positive("Total distance must be positive").optional(),
    estimatedTime: z.number().positive("Estimated time must be positive").optional(),
    wayline: z.any().optional(),
    assignedBuses: z.array(z.string()).optional(), // ObjectIds as strings
    waypoints: z
      .array(
        z.object({
          location: z.string().optional(),
          latitude: z.number().optional(),
          longitude: z.number().optional(),
          studentDensity: z
            .enum([STUDENT_DENSITY.LOW, STUDENT_DENSITY.MEDIUM, STUDENT_DENSITY.HIGH])
            .optional(),
        })
      )
      .optional(),
  }),
});


export const RouteValidation = {
  create,update
};
