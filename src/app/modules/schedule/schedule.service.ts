import { SCHEDULE_DIRECTIONS, SCHEDULE_USER_TYPES } from "../../../enums";
import { ISchedule } from "./schedule.interface";
import ScheduleModel from "./schedule.model";
import ApiError from "../../../errors/ApiError";
import ScheduleAssignmentModel from "../scheduleAssign/scheduleAssign.model";

export const ScheduleService = {
  createSchedule: async (data: ISchedule) => {
    const schedule = await ScheduleModel.create(data);
    return schedule;
  },

  getScheduleByRoute: async (routeId: string, scheduleMode: string, operatingDays: string) => {
    // 1. Fetch schedules
    const schedules = await ScheduleModel.find({
      routeId,
      mode: scheduleMode,
      operatingDays,
    });
    console.log("-schedules", schedules);

    // 2. Fetch all assignments for these schedules
    const scheduleIds = schedules.map((s) => s._id);
    const assignments = await ScheduleAssignmentModel.find({
      scheduleId: { $in: scheduleIds },
    })
      .populate("busId", "name")
      .populate("driverId", "name")
      .lean();

    // 3. Attach assignments to schedules
    const scheduleMap = schedules.map((schedule) => {
      const assignedBuses = assignments
        .filter((a) => a.scheduleId.toString() === schedule._id.toString())
        .map((a) => ({
          busId: a.busId,
          driverId: a.driverId,
          workingDays: a.workingDays,
        }));
      return { ...schedule.toObject(), assignedBuses };
    });

    // 4. Group schedules by direction and user type
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

    // 5. Sort by time
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

// const getSchedulesByRoute = async (routeId: string, scheduleMode: string, day: string) => {
//   const schedules = await ScheduleModel.find({
//     routeId,
//     mode: scheduleMode,
//     operatingDays: day,
//   })
//     .populate("routeId", "name startLocation endLocation")
//     .populate("assignedBuses", "name");

//   const groupedSchedules = {
//     from_campus: {
//       student: [] as ISchedule[],
//       employee: [] as ISchedule[],
//     },
//     to_campus: {
//       student: [] as ISchedule[],
//       employee: [] as ISchedule[],
//     },
//   };

//   for (const schedule of schedules) {
//     const directionKey =
//       schedule.direction === SCHEDULE_DIRECTIONS.FROM_CAMPUS
//         ? SCHEDULE_DIRECTIONS.FROM_CAMPUS
//         : SCHEDULE_DIRECTIONS.TO_CAMPUS;
//     const userTypeKey =
//       schedule.userType === SCHEDULE_USER_TYPES.STUDENT ? SCHEDULE_USER_TYPES.STUDENT : SCHEDULE_USER_TYPES.EMPLOYEE;

//     groupedSchedules[directionKey][userTypeKey].push(schedule);
//   }

//   const sortByTime = (a: ISchedule, b: ISchedule) => a.time.localeCompare(b.time);

//   Object.values(groupedSchedules).forEach((group) => {
//     group.student.sort(sortByTime);
//     group.employee.sort(sortByTime);
//   });

//   return groupedSchedules;
// };
