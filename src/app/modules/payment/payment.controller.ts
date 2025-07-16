import { Request, Response } from "express";
import { IPaymentData } from "./payment.interface";
import { ECBRouteStopages } from "../../../constants/stopages";
import { getNearestStop } from "./payment.util";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";

const createPayment = async (req: Request, res: Response): Promise<void> => {
  console.log(req.body);
  const data: IPaymentData = req.body;

  const nearestStop = getNearestStop(data.location, ECBRouteStopages);
  console.table([nearestStop]);

  // throw ApiError.badRequest("Insuffecient balance");

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Payment successful",
    data: {
      fare: nearestStop.fare,
      stop: nearestStop.name,
    },
  });
};

export const PaymentController = {
  createPayment,
};
