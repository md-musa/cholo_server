import { SCHEDULE_DIRECTIONS, SCHEDULE_USER_TYPES } from "../../../enums";
import { ISchedule } from "./schedule.interface";
import ScheduleModel from "./schedule.model";
import ApiError from "../../../errors/ApiError";
import AssignmentModel from "../assignment/assignment.model";
import moment from "moment";
import { attachAssignmentsToSchedules, groupAndSortSchedules } from "./schedule.util";

export const ScheduleService = {
  createSchedule: async (data: ISchedule) => {
    return await ScheduleModel.create(data);
  },

  getScheduleByRoute: async (routeId: string, scheduleMode: string, operatingDays: string) => {
    const schedules = await ScheduleModel.find({
      routeId,
      mode: scheduleMode,
      operatingDays,
    });

    const scheduleIds = schedules.map((s) => s._id);
    const todayStart = moment().startOf("day").toDate();
    const todayEnd = moment().endOf("day").toDate();

    const assignments = await AssignmentModel.find({
      scheduleId: { $in: scheduleIds },
      $or: [
        { assignmentType: "fixed" },
        { assignmentType: "one-off", specificDate: { $gte: todayStart, $lte: todayEnd } },
      ],
    })
      .populate("busId", "name")
      .populate("driverId", "name")
      .lean();

    const schedulesWithAssignments = attachAssignmentsToSchedules(schedules, assignments);
    return groupAndSortSchedules(schedulesWithAssignments);
  },

  getScheduleForAdminByRoute: async (routeId: string, scheduleMode: string) => {
    const schedules = await ScheduleModel.find({
      routeId,
      mode: scheduleMode,
    });

    const scheduleIds = schedules.map((s) => s._id);
    const todayStart = moment().startOf("day").toDate();
    const todayEnd = moment().endOf("day").toDate();

    const assignments = await AssignmentModel.find({
      scheduleId: { $in: scheduleIds },
      $or: [
        { assignmentType: "fixed" },
        { assignmentType: "one-off", specificDate: { $gte: todayStart, $lte: todayEnd } },
      ],
    })
      .populate("busId", "name")
      .populate("driverId", "name")
      .lean();

    const schedulesWithAssignments = attachAssignmentsToSchedules(schedules, assignments);
    return groupAndSortSchedules(schedulesWithAssignments);
  },

  updateSchedule: async (id: string, data: ISchedule) => {
    const updated = await ScheduleModel.findByIdAndUpdate(id, data, { new: true });
    if (!updated) throw ApiError.notFound("Schedule not found");
    return updated;
  },

  deleteSchedule: async (id: string) => {
    const deleted = await ScheduleModel.findByIdAndDelete(id);
    if (!deleted) throw ApiError.notFound("Schedule not found");
    return deleted;
  },
};
