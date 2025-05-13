import { TripModel } from "./../trip/trip.model";
import { Request, Response } from "express";
import { format, parse } from "date-fns";
import { StatusCodes } from "http-status-codes";

import { ISchedule } from "./schedule.interface";
import { ScheduleService } from "./schedule.service";
import sendResponse from "../../../shared/sendResponse";
import ApiError from "../../../errors/ApiError";
import config from "../../../config";
import { SCHEDULE_OPERATING_DAYS } from "../../../constants";

const createSchedule = async (req: Request, res: Response) => {
  console.log(req.body.time);
  const data: ISchedule = req.body;

  const result = await ScheduleService.createSchedule(data);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Schedule created successfully",
    data: result,
  });
};

const getAllSchedules = async (req: Request, res: Response) => {
  const result = await ScheduleService.getAllSchedules();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Schedules fetched successfully",
    data: result,
  });
};

const getSchedulesByRoute = async (req: Request, res: Response) => {
  let { routeId, day } = req.query;

  if (!routeId) {
    throw ApiError.badRequest("Route ID is required");
  }

  const scheduleMode = config.APP_VARIABLES.SCHEDULE_MODE;
  if (day !== SCHEDULE_OPERATING_DAYS.FRIDAY) {
    day = SCHEDULE_OPERATING_DAYS.WEEKDAYS;
  }

  const result = await ScheduleService.getSchedulesByRoute(routeId as string, scheduleMode, day as string);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Schedules fetched successfully",
    data: result,
  });
};

const updateSchedule = async (req: Request, res: Response) => {
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
};

const deleteSchedule = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) throw ApiError.badRequest("Schedule ID is required");

  const result = await ScheduleService.deleteSchedule(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Schedule deleted successfully",
    data: result,
  });
};

export const ScheduleController = {
  createSchedule,
  getAllSchedules,
  getSchedulesByRoute,
  updateSchedule,
  deleteSchedule,
};
