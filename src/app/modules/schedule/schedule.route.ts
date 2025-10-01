import express from "express";
import { ScheduleController } from "./schedule.controller";
import validateRequest from "../../middlewares/validateRequest";
import { ScheduleValidation } from "./schedule.validation";

const router = express.Router();

// router.get("/", ScheduleController.getSchedules);
router.get("/route/:routeId", ScheduleController.getScheduleByRoute);
router.get("/admin/route/:routeId", ScheduleController.getScheduleForAdminByRoute);

router.post(
  "/",
  validateRequest(ScheduleValidation.create),
  // auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  ScheduleController.createSchedule
);

router.put(
  "/:id",
  validateRequest(ScheduleValidation.update),
  // auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  ScheduleController.updateSchedule
);

router.delete("/:id", ScheduleController.deleteSchedule);

export const ScheduleRouter = router;
