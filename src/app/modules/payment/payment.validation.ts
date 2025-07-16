import { z } from "zod";

const create = z.object({
  body: z.object({
    user: z.string().nonempty("UserId is required"),
    route: z.string().nonempty("routeId is required"),
    bus: z.string().nonempty("BusId is required"),
    schedule: z.string().nonempty("ScheduleID is required"),
    nfcUid: z.string().nonempty("NFC_UID is required"),
    location: z.object({
      latitude: z.number(),
      longitude: z.number(),
    }),
  }),
});

export const PaymentValidation = { create };
