import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { DriverTripController, UserTripController } from "./trip.controller";
import { TripValidation } from "./trip.validation";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums";

const router = express.Router();

router.post(
  "/",
  validateRequest(TripValidation.create),
  // auth(USER_ROLES.STUDENT, USER_ROLES.EMPLOYEE),
  DriverTripController.create
);

router.put(
  "/:id",
  validateRequest(TripValidation.update),
  // auth(USER_ROLES.STUDENT, USER_ROLES.EMPLOYEE),
  DriverTripController.update
);

router.get("/:id", DriverTripController.getById);
router.get("/", DriverTripController.getAll);
router.delete("/:id", DriverTripController.delete);

router.post(
  "/userTrip",
  validateRequest(TripValidation.userTripCreate),
  // auth(USER_ROLES.STUDENT, USER_ROLES.EMPLOYEE),
  UserTripController.create
);

export const TripRouter = router;
