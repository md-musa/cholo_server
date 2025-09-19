import ApiError from "../../../errors/ApiError";
import ScheduleModel from "../schedule/schedule.model";
import ScheduleAssignmentModel from "./scheduleAssign.model";
import { IAssignment } from "./scheduleAssign.interface";
import { TripModel } from "../trip/trip.model";
import moment from "moment";

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export const ScheduleAssignmentService = {
  // -------------------- CREATE --------------------
  create: async (queries: Partial<IAssignment>) => {
    const { driverId, busId, scheduleId } = queries;
    if (!scheduleId) throw ApiError.badRequest("scheduleId is required");

    const schedule = await ScheduleModel.findById(scheduleId);
    if (!schedule) throw ApiError.notFound("Schedule not found");

    // Only check driver conflicts if driverId is provided
    if (driverId) {
      const newTimeMinutes = timeToMinutes(schedule.time);

      // Fetch all assignments for this driver
      const assignments = await ScheduleAssignmentModel.find({ driverId }).populate("scheduleId");

      const hasConflict = assignments.some((a) => {
        const assignedSchedule = a.scheduleId as any;
        if (!assignedSchedule) return false;
        // Only check same operating day
        if (assignedSchedule.operatingDays !== schedule.operatingDays) return false;

        const existingTimeMinutes = timeToMinutes(assignedSchedule.time);
        return Math.abs(existingTimeMinutes - newTimeMinutes) < 60; // 1-hour gap
      });

      if (hasConflict) throw ApiError.conflict("Driver has another schedule at this time or within 1-hour gap");
    }

    // Create assignment (driver and bus optional)
    return await ScheduleAssignmentModel.create({
      driverId: driverId || null,
      busId: busId || null,
      scheduleId,
    });
  },

  // -------------------- GET BY DRIVER --------------------
  getByDriver: async (driverId: string) => {
    // 1. Find all assignments for this driver
    const assignments = await ScheduleAssignmentModel.find({ driverId })
      .populate({
        path: "scheduleId",
        populate: {
          path: "routeId",
          select: "routeName",
        },
      })
      .populate("busId", "name busType")
      .populate("driverId", "name")
      .lean();

    const ids = assignments.map((a) => a._id);

    // 2. Find all trips linked to these assignments
    const startOfDay = moment().startOf("day").toDate();
    const endOfDay = moment().endOf("day").toDate();

    const trips = await TripModel.find({
      assignmentId: { $in: ids },
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    }).lean();

    let assignmentsWithTripInfo = assignments.map((a) => {
      const relatedTrip = trips.find((t) => t.assignmentId?.toString() === a._id.toString());

      return {
        ...a,
        tripStatus: relatedTrip ? relatedTrip.status : "scheduled",
        tripId: relatedTrip?._id || null,
        startTime: relatedTrip?.startTime || null,
        endTime: relatedTrip?.endTime || null,
      };
    });
    console.log("-assignmentsWithTripInfo", assignmentsWithTripInfo);
    // 4. Sort by assignment time (HH:mm format)
    assignmentsWithTripInfo = assignmentsWithTripInfo.sort((a, b) => {
      const timeA = moment(a.scheduleId.time, "HH:mm");
      const timeB = moment(b.scheduleId.time, "HH:mm");
      return timeA.diff(timeB);
    });

    return assignmentsWithTripInfo;
  },

  // -------------------- GET ALL --------------------
  getAll: async () => {
    return await ScheduleAssignmentModel.find().populate("scheduleId").populate("busId").populate("driverId").lean();
  },

  // -------------------- UPDATE --------------------
  update: async (id: string, data: Partial<IAssignment>) => {
    const assignment = await ScheduleAssignmentModel.findById(id);
    if (!assignment) throw ApiError.notFound("Assignment not found");

    // If updating driver or schedule, check for time conflicts
    if ((data.driverId || assignment.driverId) && (data.scheduleId || assignment.scheduleId)) {
      const driverId = data.driverId || assignment.driverId;
      const scheduleId = data.scheduleId || assignment.scheduleId;

      const schedule = await ScheduleModel.findById(scheduleId);
      if (!schedule) throw ApiError.notFound("Schedule not found");

      if (driverId) {
        const newTimeMinutes = timeToMinutes(schedule.time);

        const assignments = await ScheduleAssignmentModel.find({
          driverId,
          _id: { $ne: id }, // exclude current assignment
        }).populate("scheduleId");

        const hasConflict = assignments.some((a) => {
          const assignedSchedule = a.scheduleId as any;
          if (!assignedSchedule) return false;
          if (assignedSchedule.operatingDays !== schedule.operatingDays) return false;

          const existingTimeMinutes = timeToMinutes(assignedSchedule.time);
          return Math.abs(existingTimeMinutes - newTimeMinutes) < 60;
        });

        if (hasConflict) throw ApiError.conflict("Driver has another schedule at this time or within 1-hour gap");
      }
    }

    return await ScheduleAssignmentModel.findByIdAndUpdate(id, data, { new: true });
  },

  // -------------------- REMOVE --------------------
  remove: async (id: string) => {
    return await ScheduleAssignmentModel.findByIdAndDelete(id);
  },
};
