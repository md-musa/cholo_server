import { z } from "zod";

const create = z.object({
  body: z.object({
    user: z.string().nonempty("UserId is required"),
    route: z.string().nonempty("routeId is required"),
    bus: z.string().nonempty("BusId is required"),
    schedule: z.string().nonempty("ScheduleID is required"),
    nfcUid: z.string().nonempty("NFC_UID is required"),
    coords: z.array(z.number()).length(2).nonempty("Coordinate is required"),
  }),
});

export const PaymentValidation = { create };
