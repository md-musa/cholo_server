import { StatusCodes } from "http-status-codes";
import sendResponse from "../../../shared/sendResponse";
import { ITrip } from "./trip.interface";
import { TripService, UserTripService } from "./trip.service";
import { Request, Response } from "express";
import ApiError from "../../../errors/ApiError";

export const TripController = {
  // Create a trip
  create: async (req: Request, res: Response) => {
    const tripData: ITrip = req.body;

    console.log(tripData);
    const trip = await TripService.create(tripData);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: "Trip created successfully",
      data: trip,
    });
  },

  // Get trip by ID
  getById: async (req: Request, res: Response) => {
    const { id } = req.params;
    const trip = await TripService.getById(id);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Trip retrieved successfully",
      data: trip,
    });
  },

  // Get all trips
  getAll: async (req: Request, res: Response) => {
    const trips = await TripService.getAll();

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Trips retrieved successfully",
      data: trips,
    });
  },

  // Update trip
  update: async (req: Request, res: Response) => {
    const { id } = req.params;
    const payload: Partial<ITrip> = req.body;
    console.log(id, payload);
    if (!payload.status) throw ApiError.badRequest("Status is required");

    const trip = await TripService.update(id, payload);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Trip updated successfully",
      data: trip,
    });
  },

  // Delete trip
  delete: async (req: Request, res: Response) => {
    const { id } = req.params;
    const trip = await TripService.delete(id);

    sendResponse(res, {
      success: true,
      statusCode: trip ? StatusCodes.OK : StatusCodes.NOT_FOUND,
      message: trip ? "Trip deleted successfully" : "Trip not found",
      data: trip || null,
    });
  },
};

export const UserTripController = {
  create: async (req: Request, res: Response) => {
    console.log(req.body);
    const tripData = req.body;
    console.log(tripData);
    const trip = await UserTripService.create(tripData);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: "Trip created successfully",
      data: trip,
    });
  },
};
