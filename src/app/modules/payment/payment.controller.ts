import { Request, Response } from "express";
import { IPaymentData } from "./payment.interface";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import { RouteModel } from "../route/route.model";
import { findNearestStop } from "./payment.util";
import { TransactionModel } from "./payment.model";

const createPayment = async (req: Request, res: Response): Promise<void> => {
  const data: IPaymentData = req.body;

  const route = await RouteModel.findById(data.routeId).lean();
  if (!route) throw ApiError.notFound("Route not found");

  const history = await TransactionModel.find({ nfcUid: data.nfcUid }).sort({ createdAt: -1 }).limit(1).lean();
  if (history.length === 0) {
    const nearestStop = findNearestStop(data.checkinCoords, route.routeLine, route.stopages);

    const newTransaction = await TransactionModel.create({
      nfcUid: data.nfcUid,
      routeId: data.routeId,
      busId: data.busId,
      startStopage: nearestStop.name,
    });
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: "Payment initiated",
      data: newTransaction,
    });
  } else {
    const lastTransaction = history[0];
    if (lastTransaction.endStopage) {
      throw ApiError.badRequest("You have already checked out");
    }

    const nearestStop = findNearestStop(data.checkoutCoords, route.routeLine, route.stopages);
    if (!nearestStop) {
      throw ApiError.notFound("No nearby stop found for checkout");
    }

    const updatedData = await TransactionModel.findByIdAndUpdate(lastTransaction._id, {
      endStopage: nearestStop.name,
      checkoutTime: new Date(),
    });
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Checkout successful",
      data: updatedData,
    });

    // await handlePayment({ nfcUid: data.nfcUID, fare: nearestStop.fare });
  }
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
