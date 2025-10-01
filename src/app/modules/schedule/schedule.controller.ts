import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { ISchedule } from "./schedule.interface";
import { ScheduleService } from "./schedule.service";
import sendResponse from "../../../shared/sendResponse";
import ApiError from "../../../errors/ApiError";
import config from "../../../config";

export const ScheduleController = {
  createSchedule: async (req: Request, res: Response) => {
    const data: ISchedule = req.body;

    const result = await ScheduleService.createSchedule(data);

    sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: "Schedule created successfully",
      data: result,
    });
  },

  getScheduleByRoute: async (req: Request, res: Response) => {
    const { operatingDays } = req.query;
    const { routeId } = req.params;

    if (!routeId || !operatingDays) {
      throw ApiError.badRequest("Route ID and OperatingDays are required");
    }

    const scheduleMode = config.APP_VARIABLES.SCHEDULE_MODE;
    const result = await ScheduleService.getScheduleByRoute(routeId as string, scheduleMode, operatingDays as string);
    console.log(result);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Schedules fetched successfully",
      data: { scheduleMode, operatingDays, schedules: result },
    });
  },
  
  getScheduleForAdminByRoute: async (req: Request, res: Response) => {
    const { routeId } = req.params;

    if (!routeId) {
      throw ApiError.badRequest("Route ID is required");
    }

    const scheduleMode = config.APP_VARIABLES.SCHEDULE_MODE;
    const result = await ScheduleService.getScheduleForAdminByRoute(routeId as string, scheduleMode);
    console.log(result);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Schedules fetched successfully",
      data: { scheduleMode, schedules: result },
    });
  },

  updateSchedule: async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) throw ApiError.badRequest("Schedule ID is required");

    const data: ISchedule = req.body;
    const result = await ScheduleService.updateSchedule(id, data);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Schedule updated successfully",
      data: result,
    });
  },

  deleteSchedule: async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) throw ApiError.badRequest("Schedule ID is required");

    const result = await ScheduleService.deleteSchedule(id);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Schedule deleted successfully",
      data: result,
    });
  },
};
