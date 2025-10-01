import { Request, Response } from "express";
import { ScheduleAssignmentService } from "./assignment.service";
import sendResponse from "../../../shared/sendResponse";

export const ScheduleAssignmentController = {
  create: async (req: Request, res: Response) => {
    const assignment = await ScheduleAssignmentService.create(req.body);
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Assignment created successfully",
      data: assignment,
    });
  },

  getByDriver: async (req: Request, res: Response) => {
    const driverId = req.params.driverId;
    const assignments = await ScheduleAssignmentService.getByDriver(driverId);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Assignments fetched successfully",
      data: assignments,
    });
  },

  update: async (req: Request, res: Response) => {
    const updated = await ScheduleAssignmentService.update(req.params.id, req.body);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Assignment updated successfully",
      data: updated,
    });
  },

  remove: async (req: Request, res: Response) => {
    await ScheduleAssignmentService.remove(req.params.id);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Assignment deleted successfully",
    });
  },

  getAll: async (_req: Request, res: Response) => {
    const assignments = await ScheduleAssignmentService.getAll();
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "All assignments fetched successfully",
      data: assignments,
    });
  },
};
