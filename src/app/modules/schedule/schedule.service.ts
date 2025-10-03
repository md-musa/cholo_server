import { create } from "./../bus/bus.validation";
import { SCHEDULE_DIRECTIONS, SCHEDULE_USER_TYPES } from "../../../enums";
import { ISchedule } from "./schedule.interface";
import ScheduleModel from "./schedule.model";
import ApiError from "../../../errors/ApiError";
import AssignmentModel from "../assignment/assignment.model";
import moment from "moment";
import { TripModel } from "../trip/trip.model";

export const ScheduleService = {
  createSchedule: async (data: ISchedule) => {
    const schedule = await ScheduleModel.create(data);
    return schedule;
  },

  getScheduleByRoute: async (routeId: string, scheduleMode: string, operatingDays: string) => {
    // 1. Fetch schedules for the route
    const schedules = await ScheduleModel.find({
      routeId,
      mode: scheduleMode,
      operatingDays,
    });

    const scheduleIds = schedules.map((s) => s._id);

    // 2. Prepare today's date range
    const todayStart = moment().startOf("day").toDate();
    const todayEnd = moment().endOf("day").toDate();

    // 3. Fetch assignments (fixed + today's one-off)
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

    const assignmentIds = assignments.map((a) => a._id);

    // 4. Fetch today's trips for those assignments
    const trips = await TripModel.find({
      assignmentId: { $in: assignmentIds },
      createdAt: { $gte: todayStart, $lte: todayEnd },
    }).lean();

    // 5. Create lookup map of trips by assignmentId
    const tripMap = new Map(trips.map((t) => [t.assignmentId.toString(), t]));

    // 6. Merge trips into assignments
    const assignmentsWithTrips = assignments.map((a) => ({
      ...a,
      trip: tripMap.get(a._id.toString()) || null,
    }));

    // 7. Attach assignments to schedules
    const scheduleMap = schedules.map((schedule) => {
      const assignedBuses = assignmentsWithTrips
        .filter((a) => a.scheduleId.toString() === schedule._id.toString())
        .map((a) => ({
          busId: a.busId,
          driverId: a.driverId,
          workingDays: a.workingDays,
          assignmentType: a.assignmentType,
          specificDate: a.specificDate,
          trip: a.trip, // include merged trip here
        }));

      return { ...schedule.toObject(), assignedBuses };
    });

    // 8. Group schedules by direction & user type
    const groupedSchedules = {
      from_campus: { student: [] as ISchedule[], employee: [] as ISchedule[] },
      to_campus: { student: [] as ISchedule[], employee: [] as ISchedule[] },
    };

    for (const schedule of scheduleMap) {
      const directionKey =
        schedule.direction === SCHEDULE_DIRECTIONS.FROM_CAMPUS
          ? SCHEDULE_DIRECTIONS.FROM_CAMPUS
          : SCHEDULE_DIRECTIONS.TO_CAMPUS;

      const userTypeKey =
        schedule.userType === SCHEDULE_USER_TYPES.STUDENT ? SCHEDULE_USER_TYPES.STUDENT : SCHEDULE_USER_TYPES.EMPLOYEE;

      groupedSchedules[directionKey][userTypeKey].push(schedule);
    }

    // 9. Sort schedules by time
    const sortByTime = (a: ISchedule, b: ISchedule) => a.time.localeCompare(b.time);

    Object.values(groupedSchedules).forEach((group) => {
      group.student.sort(sortByTime);
      group.employee.sort(sortByTime);
    });

    return groupedSchedules;
  },

  getScheduleForAdminByRoute: async (routeId: string, scheduleMode: string) => {
    // Same logic as getScheduleByRoute but without operatingDays filter
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

    const scheduleMap = schedules.map((schedule) => {
      const assignedBuses = assignments
        .filter((a) => a.scheduleId.toString() === schedule._id.toString())
        .map((a) => ({
          _id: a._id,
          busId: a.busId,
          driverId: a.driverId,
          workingDays: a.workingDays,
          assignmentType: a.assignmentType,
          specificDate: a.specificDate,
        }));
      return { ...schedule.toObject(), assignedBuses };
    });

    const groupedSchedules = {
      from_campus: { student: [] as ISchedule[], employee: [] as ISchedule[] },
      to_campus: { student: [] as ISchedule[], employee: [] as ISchedule[] },
    };

    for (const schedule of scheduleMap) {
      const directionKey =
        schedule.direction === SCHEDULE_DIRECTIONS.FROM_CAMPUS
          ? SCHEDULE_DIRECTIONS.FROM_CAMPUS
          : SCHEDULE_DIRECTIONS.TO_CAMPUS;
      const userTypeKey =
        schedule.userType === SCHEDULE_USER_TYPES.STUDENT ? SCHEDULE_USER_TYPES.STUDENT : SCHEDULE_USER_TYPES.EMPLOYEE;

      groupedSchedules[directionKey][userTypeKey].push(schedule);
    }

    const sortByTime = (a: ISchedule, b: ISchedule) => a.time.localeCompare(b.time);
    Object.values(groupedSchedules).forEach((group) => {
      group.student.sort(sortByTime);
      group.employee.sort(sortByTime);
    });

    return groupedSchedules;
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
