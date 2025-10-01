import { z } from "zod";
import { USER_ROLES } from "../../../enums";

const universityEmailRegex = /^[a-zA-Z0-9._%+-]+@(diu\.edu\.bd|daffodilvarsity\.edu\.bd)$/;

const register = z.object({
  body: z.object({
    name: z.string().nonempty("Name is required"),
    email: z.string().email("Invalid email format").regex(universityEmailRegex, "Use your university email"),
    role: z.nativeEnum(USER_ROLES),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    phoneNumber: z
      .string()
      .length(11, "Phone number must be 11 digits long")
      .startsWith("01", "Phone number must start with 01")
      .optional(),
    houseCoords: z.array(z.number()).length(2, "houseCoords must be [longitude, latitude]").optional(),
    routeId: z.string().length(24, "Invalid MongoDB ObjectId").optional(),
    notificationToken: z.string().optional(),
  }),
});

const login = z.object({
  body: z.object({
    email: z.string().email("Invalid email format").regex(universityEmailRegex, "Use your university email"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
  }),
});

export const AuthValidation = { register, login };
