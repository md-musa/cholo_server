import { SCHEDULE_DIRECTIONS, SCHEDULE_USER_TYPES } from "../../../enums";
import { ISchedule } from "./schedule.interface";

export const attachAssignmentsToSchedules = (schedules: ISchedule[], assignments: any[]) => {
  return schedules.map((schedule) => {
    const assignedBuses = assignments
      .filter((a) => a.scheduleId.toString() === schedule._id.toString())
      .map((a) => ({
        busId: a.busId,
        driverId: a.driverId,
        workingDays: a.workingDays,
        assignmentType: a.assignmentType,
        specificDate: a.specificDate,
      }));
    return { ...schedule, assignedBuses };
  });
};

export const groupAndSortSchedules = (schedules: ISchedule[]) => {
  const groupedSchedules = {
    from_campus: { student: [] as ISchedule[], employee: [] as ISchedule[] },
    to_campus: { student: [] as ISchedule[], employee: [] as ISchedule[] },
  };

  for (const schedule of schedules) {
    const directionKey =
      schedule.direction === SCHEDULE_DIRECTIONS.FROM_CAMPUS
        ? SCHEDULE_DIRECTIONS.FROM_CAMPUS
        : SCHEDULE_DIRECTIONS.TO_CAMPUS;
    const userTypeKey =
      schedule.userType === SCHEDULE_USER_TYPES.STUDENT ? SCHEDULE_USER_TYPES.STUDENT : SCHEDULE_USER_TYPES.EMPLOYEE;

    groupedSchedules[directionKey][userTypeKey].push(schedule);
  }

  const sortByTime = (a: ISchedule, b: ISchedule) => {
    if (!a.time && !b.time) return 0; // both missing
    if (!a.time) return 1; // push undefined to end
    if (!b.time) return -1;
    return a.time.localeCompare(b.time);
  };
  Object.values(groupedSchedules).forEach((group) => {
    group.student.sort(sortByTime);
    group.employee.sort(sortByTime);
  });

  return groupedSchedules;
};
