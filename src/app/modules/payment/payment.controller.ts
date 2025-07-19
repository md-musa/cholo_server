import { Request, Response } from "express";
import { IPaymentData } from "./payment.interface";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import { RouteModel } from "../route/route.model";
import { findNearestStop } from "./payment.util";

const createPayment = async (req: Request, res: Response): Promise<void> => {
  const data: IPaymentData = req.body;

  const route = await RouteModel.findById(data.route).lean();
  if (!route) {
    throw ApiError.notFound("Route not found");
  }

  const nearestStop = findNearestStop(data.coords, route.routeLine, route.stopages);
  const { name, fare } = nearestStop;

  console.log("\nNearest stopage:");
  console.table({ name, fare });

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Payment is successful",
    data: {
      fare: nearestStop.fare,
      stop: nearestStop.name,
    },
  });
};

type HandlePaymentInput = {
  nfcUid: string;
  fare: number;
};

// await handlePayment({ nfcUid: data.nfcUID, fare: nearestStop.fare });
async function handlePayment({ nfcUid, fare }: HandlePaymentInput): Promise<void> {
  // Simulate async behavior
  await new Promise((res) => setTimeout(res, 300));

  // Random outcome
  const outcomes = ["success", "insufficient_balance", "success", "invalid_nfc", "success"];
  const result = outcomes[Math.floor(Math.random() * outcomes.length)];

  switch (result) {
    case "success":
      console.log(`Payment of ${fare} successful for UID: ${nfcUid}`);
      return;

    case "insufficient_balance":
      throw ApiError.badRequest("Insufficient balance");

    case "invalid_nfc":
      throw ApiError.badRequest("Invalid NFC UID");

    default:
      throw ApiError.internal("Unknown error during payment");
  }
}

export const PaymentController = {
  createPayment,
};
