import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { TripController, UserTripController } from "./trip.controller";
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

router.post(
  "/userTrip",
  validateRequest(TripValidation.userTripCreate),
  // auth(USER_ROLES.STUDENT, USER_ROLES.EMPLOYEE),
  UserTripController.create
);

export const TripRouter = router;
