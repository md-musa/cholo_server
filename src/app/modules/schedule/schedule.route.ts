import express from "express";
import { ScheduleController } from "./schedule.controller";
import validateRequest from "../../middlewares/validateRequest";
import { ScheduleValidation } from "./schedule.validation";

const router = express.Router();

router.get("/", ScheduleController.getAllSchedules);
router.get("/get-single-route-schedule", ScheduleController.getSchedulesByRoute);
router.post("/", validateRequest(ScheduleValidation.create), ScheduleController.createSchedule);
router.put("/:id", validateRequest(ScheduleValidation.update), ScheduleController.updateSchedule);
router.delete("/:id", ScheduleController.deleteSchedule);

export const ScheduleRouter = router;
