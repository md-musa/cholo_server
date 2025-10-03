import ApiError from "../../../errors/ApiError";
import ScheduleModel from "../schedule/schedule.model";
import AssignmentModel from "./assignment.model";
import { IAssignment } from "./assignment.interface";
import { TripModel } from "../trip/trip.model";
import moment from "moment";

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export const ScheduleAssignmentService = {
  // -------------------- CREATE --------------------
  create: async (queries: Partial<IAssignment>) => {
    const { driverId, busId, scheduleId, assignmentType, specificDate } = queries;
    if (!scheduleId) throw ApiError.badRequest("scheduleId is required");

    const schedule = await ScheduleModel.findById(scheduleId);
    if (!schedule) throw ApiError.notFound("Schedule not found");

    // Only check driver conflicts if driverId is provided
    if (driverId) {
      const newTimeMinutes = timeToMinutes(schedule.time);

      // Fetch all assignments for this driver (fixed and one-off)
      const assignments = await AssignmentModel.find({
        driverId,
        $or: [
          { assignmentType: "fixed" },
          { assignmentType: "one-off", specificDate: { $gte: moment().startOf("day").toDate() } },
        ],
      }).populate("scheduleId");

      const hasConflict = assignments.some((a) => {
        const assignedSchedule = a.scheduleId as any;
        if (!assignedSchedule) return false;

        // Check only same operating day or specific date
        if (a.assignmentType === "fixed" && assignedSchedule.operatingDays !== schedule.operatingDays) return false;
        if (a.assignmentType === "one-off" && specificDate) {
          const assignedDate = moment(a.specificDate).startOf("day");
          const targetDate = moment(specificDate).startOf("day");
          if (!assignedDate.isSame(targetDate)) return false;
        }

        const existingTimeMinutes = timeToMinutes(assignedSchedule.time);
        return Math.abs(existingTimeMinutes - newTimeMinutes) < 60; // 1-hour gap
      });

      if (hasConflict) throw ApiError.conflict("Driver has another schedule at this time or within 1-hour gap");
    }

    // Create assignment
    return await AssignmentModel.create({
      driverId: driverId || null,
      busId: busId || null,
      scheduleId,
      assignmentType: assignmentType || "fixed",
      specificDate: specificDate || null,
    });
  },

  // -------------------- GET BY DRIVER --------------------
  getByDriver: async (driverId: string) => {
    const todayStart = moment().startOf("day").toDate();
    const todayEnd = moment().endOf("day").toDate();

    // Fetch assignments (fixed + today’s one-off)
    const assignments = await AssignmentModel.find({
      driverId,
      $or: [
        { assignmentType: "fixed" },
        { assignmentType: "one-off", specificDate: { $gte: todayStart, $lte: todayEnd } },
      ],
    })
      .populate({
        path: "scheduleId",
        populate: { path: "routeId", select: "routeName" },
      })
      .populate("busId", "name busType")
      .populate("driverId", "name")
      .lean();

    const ids = assignments.map((a) => a._id);

    const trips = await TripModel.find({
      assignmentId: { $in: ids },
      createdAt: { $gte: todayStart, $lte: todayEnd },
    }).lean();

    return assignments
      .map((a) => {
        const relatedTrip = trips.find((t) => t.assignmentId?.toString() === a._id.toString());
        return {
          ...a,
          tripStatus: relatedTrip ? relatedTrip.status : "scheduled",
          tripId: relatedTrip?._id || null,
          startTime: relatedTrip?.startTime || null,
          endTime: relatedTrip?.endTime || null,
        };
      })
      .sort((a, b) => {
        const timeA = moment((a.scheduleId as any).time, "HH:mm");
        const timeB = moment((b.scheduleId as any).time, "HH:mm");
        return timeA.diff(timeB);
      });
  },

  // -------------------- GET ALL --------------------
  getAll: async () => {
    return await AssignmentModel.find().populate("scheduleId").populate("busId").populate("driverId").lean();
  },

  // -------------------- UPDATE --------------------
  update: async (id: string, data: Partial<IAssignment>) => {
    const assignment = await AssignmentModel.findById(id);
    if (!assignment) throw ApiError.notFound("Assignment not found");

    // Check conflicts if driver or schedule changes
    if ((data.driverId || assignment.driverId) && (data.scheduleId || assignment.scheduleId)) {
      const driverId = data.driverId || assignment.driverId;
      const scheduleId = data.scheduleId || assignment.scheduleId;

      const schedule = await ScheduleModel.findById(scheduleId);
      if (!schedule) throw ApiError.notFound("Schedule not found");

      if (driverId) {
        const newTimeMinutes = timeToMinutes(schedule.time);

        const assignments = await AssignmentModel.find({
          driverId,
          _id: { $ne: id },
          $or: [
            { assignmentType: "fixed" },
            { assignmentType: "one-off", specificDate: { $gte: moment().startOf("day").toDate() } },
          ],
        }).populate("scheduleId");

        const hasConflict = assignments.some((a) => {
          const assignedSchedule = a.scheduleId as any;
          if (!assignedSchedule) return false;

          if (a.assignmentType === "fixed" && assignedSchedule.operatingDays !== schedule.operatingDays) return false;
          if (a.assignmentType === "one-off" && assignment.assignmentType === "one-off" && assignment.specificDate) {
            const assignedDate = moment(a.specificDate).startOf("day");
            const targetDate = moment(assignment.specificDate).startOf("day");
            if (!assignedDate.isSame(targetDate)) return false;
          }

          const existingTimeMinutes = timeToMinutes(assignedSchedule.time);
          return Math.abs(existingTimeMinutes - newTimeMinutes) < 60;
        });

        if (hasConflict) throw ApiError.conflict("Driver has another schedule at this time or within 1-hour gap");
      }
    }

    return await AssignmentModel.findByIdAndUpdate(id, data, { new: true });
  },

  // -------------------- REMOVE --------------------
  remove: async (id: string) => {
    return await AssignmentModel.findByIdAndDelete(id);
  },
};
