import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { TripController } from "./trip.controller";
import { TripValidation } from "./trip.validation";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums";

const router = express.Router();

router.post(
  "/",
  validateRequest(TripValidation.create),
  // auth(USER_ROLES.STUDENT, USER_ROLES.EMPLOYEE),
  TripController.create
);

router.put(
  "/:id",
  validateRequest(TripValidation.update),
  // auth(USER_ROLES.STUDENT, USER_ROLES.EMPLOYEE),
  TripController.update
);

router.get("/:id", TripController.getById);
router.get("/", TripController.getAll);
router.delete("/:id", TripController.delete);

export const TripRouter = router;
