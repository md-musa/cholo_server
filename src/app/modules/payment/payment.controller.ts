import { Request, Response } from "express";
import { IPaymentData } from "./payment.interface";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import { RouteModel } from "../route/route.model";
import { findNearestStop } from "./payment.util";

const createPayment = async (req: Request, res: Response): Promise<void> => {
  console.time("createPayment");
  const data: IPaymentData = req.body;

  const route = await RouteModel.findById(data.route).lean();
  if (!route) {
    throw ApiError.notFound("Route not found");
  }

  const nearestStop = findNearestStop(data.coords, route.routeLine, route.stopages);
  console.log("NearestStop:-----------\n", nearestStop);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Payment successful",
    data: {
      fare: nearestStop.fare,
      stop: nearestStop.name,
    },
  });

  console.timeEnd("createPayment");
};

export const PaymentController = {
  createPayment,
};
