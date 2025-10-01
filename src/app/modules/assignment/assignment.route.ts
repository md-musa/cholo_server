import { Router } from "express";
import { ScheduleAssignmentController } from "./assignment.controller";
import ScheduleAssignmentValidation from "./assignment.validation";
import validateRequest from "../../middlewares/validateRequest";

const router = Router();

router.post("/", validateRequest(ScheduleAssignmentValidation.create), ScheduleAssignmentController.create);

router.get("/driver/:driverId", ScheduleAssignmentController.getByDriver);

router.put("/:id", validateRequest(ScheduleAssignmentValidation.update), ScheduleAssignmentController.update);

router.delete("/:id", ScheduleAssignmentController.remove);

router.get("/", ScheduleAssignmentController.getAll);

export default router;
